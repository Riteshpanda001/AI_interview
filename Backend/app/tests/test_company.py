from app.utils.helpers import SystemHelpers

def test_sanitize_filename():
    assert SystemHelpers.sanitize_filename("my_resume#$.pdf") == "my_resume.pdf"
    assert SystemHelpers.sanitize_filename("valid-file_name.docx") == "valid-file_name.docx"
