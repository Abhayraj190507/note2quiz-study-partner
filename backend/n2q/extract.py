"""Pull plain text out of uploaded files. Images need OCR, which is not bundled: they are stored with status 'needs_text'."""
import io
import re
import shutil
import subprocess
import tempfile
import zipfile
from xml.etree import ElementTree as ET

TEXT_EXT = {"txt", "md", "text", "csv"}
IMG_EXT = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED = TEXT_EXT | IMG_EXT | {"pdf", "docx", "pptx"}


def ext_of(name):
    return name.rsplit(".", 1)[-1].lower() if "." in name else ""


def type_label(name):
    e = ext_of(name)
    return {"pdf": "PDF", "docx": "DOCX", "pptx": "PPT", "txt": "TXT", "md": "TXT", "text": "TXT", "csv": "TXT"}.get(e, "IMG")


def _xml_text(data, tag_suffix):
    root = ET.fromstring(data)
    return [(el.text or "") for el in root.iter() if el.tag.endswith(tag_suffix)]


def _docx(raw):
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    paras = []
    for p in root.iter():
        if p.tag.endswith("}p"):
            paras.append("".join(t.text or "" for t in p.iter() if t.tag.endswith("}t")))
    return "\n".join(x for x in paras if x.strip()), max(1, len(paras) // 40)


def _pptx(raw):
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        slides = sorted((n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
                        key=lambda n: int(re.findall(r"\d+", n)[0]))
        out = ["\n".join(t for t in _xml_text(z.read(n), "}t") if t.strip()) for n in slides]
    return "\n\n".join(out), max(1, len(slides))


def _pdf(raw):
    try:
        from pypdf import PdfReader
        r = PdfReader(io.BytesIO(raw))
        return "\n\n".join((p.extract_text() or "") for p in r.pages), max(1, len(r.pages))
    except ImportError:
        pass
    if shutil.which("pdftotext"):
        with tempfile.NamedTemporaryFile(suffix=".pdf") as f:
            f.write(raw); f.flush()
            out = subprocess.run(["pdftotext", "-layout", f.name, "-"], capture_output=True, timeout=60).stdout.decode("utf-8", "ignore")
        return out, max(1, out.count("\f") + 1)
    raise RuntimeError("No PDF reader available. Install pypdf.")


def extract(name, raw):
    """Returns (text, pages, status). Raises ValueError for unsupported/corrupt files."""
    e = ext_of(name)
    if e not in ALLOWED:
        raise ValueError(f"Unsupported file type .{e or '?'}. Use PDF, DOCX, PPTX, TXT or an image.")
    if e in IMG_EXT:
        return "", 1, "needs_text"
    try:
        if e in TEXT_EXT:
            text, pages = raw.decode("utf-8", "ignore"), max(1, len(raw) // 3000)
        elif e == "docx":
            text, pages = _docx(raw)
        elif e == "pptx":
            text, pages = _pptx(raw)
        else:
            text, pages = _pdf(raw)
    except (zipfile.BadZipFile, KeyError, ET.ParseError) as ex:
        raise ValueError(f"Could not read {name}: the file looks damaged.") from ex
    except RuntimeError:
        raise
    except Exception as ex:  # pypdf raises many types on corrupt files
        raise ValueError(f"Could not read {name}.") from ex
    text = re.sub(r"[ \t]+", " ", text.replace("\x00", "")).strip()
    return text, pages, ("ready" if len(text) > 20 else "needs_text")
