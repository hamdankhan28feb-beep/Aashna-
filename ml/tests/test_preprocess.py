import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import preprocess


class PreprocessTests(unittest.TestCase):
    def test_resolve_class_names_uses_letter_folders(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            raw_dir = Path(tmpdir)
            (raw_dir / "0").mkdir()
            (raw_dir / "1").mkdir()
            (raw_dir / "a").mkdir()
            (raw_dir / "b").mkdir()

            classes = preprocess.resolve_class_names(raw_dir)

            self.assertEqual(classes, ["A", "B"])


if __name__ == "__main__":
    unittest.main()
