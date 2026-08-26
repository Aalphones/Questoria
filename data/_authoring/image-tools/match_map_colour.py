"""Die Palette einer nachgeschaerften Leinwand auf die Vorlage zurueckziehen.

Beim kachelweisen Nachschaerfen erfindet FLUX.2 nicht nur Struktur, sondern
auch Farbe: eine Kachel wird eine Spur heller, die naechste eine Spur gelber.
Einzeln faellt das nicht auf, ueber eine ganze Leinwand ergibt es einen
Flickenteppich - und der Weltstil driftet weg.

Der Trick: die **groben** Toene tragen die Farbe, die **feinen** tragen die
Zeichnung. Also grobe Toene aus der Vorlage nehmen (dem rein hochskalierten
Bild, das farblich noch stimmt) und die feine Zeichnung aus dem
nachgeschaerften Bild. Das Ergebnis hat die Palette der Vorlage und das Detail
des Nachschaerfens - und ganz nebenbei kann kein Kachel-zu-Kachel-Farbsprung
ueberleben, weil die Farbe gar nicht mehr aus den Kacheln kommt.

Der Radius entscheidet, wo die Grenze zwischen "grob" und "fein" liegt: gross
genug, dass die neue Zeichnung vollstaendig als "fein" gilt, klein genug, dass
echte Farbflaechen der Vorlage noch als "grob" durchkommen.
"""
import argparse

import numpy as np
from PIL import Image, ImageFilter


def coarse_tones(image: Image.Image, radius: int) -> np.ndarray:
    return np.asarray(image.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("refined", help="nachgeschaerfte Leinwand (bringt die Zeichnung mit)")
    parser.add_argument("reference", help="rein hochskalierte Leinwand (bringt die Farbe mit)")
    parser.add_argument("target", help="wohin das Ergebnis geschrieben wird")
    parser.add_argument("--radius", type=int, default=64, help="Grenze zwischen grob und fein")
    parser.add_argument(
        "--amount",
        type=float,
        default=1.0,
        help="wie vollstaendig die Vorlagenfarbe uebernommen wird (0 = gar nicht, 1 = ganz)",
    )
    arguments = parser.parse_args()

    refined = Image.open(arguments.refined).convert("RGB")
    reference = Image.open(arguments.reference).convert("RGB")
    if refined.size != reference.size:
        reference = reference.resize(refined.size, Image.LANCZOS)

    refined_coarse = coarse_tones(refined, arguments.radius)
    corrected = np.asarray(refined, dtype=np.float32) + arguments.amount * (
        coarse_tones(reference, arguments.radius) - refined_coarse
    )
    Image.fromarray(np.clip(corrected, 0, 255).astype(np.uint8)).save(arguments.target)
    print(f"geschrieben: {arguments.target} {refined.size} (Radius {arguments.radius}, Anteil {arguments.amount})")


if __name__ == "__main__":
    main()
