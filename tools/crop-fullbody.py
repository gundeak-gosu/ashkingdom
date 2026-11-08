# 캐릭터 시트에서 '등신대 전신' 한 명을 잘라 assets/heroines/<id>/full.webp 로 저장한다(화면용: 슬롯·캐릭터 만들기·상태창·만남).
# 시트마다 배치가 달라 좌표를 눈으로 정해 둔다(시트 원본 1536×1024 기준). 노출이 많은 기본 의상 대신 단정한 의상을 고른 캐릭터도 있다.
# 사용: python3 tools/crop-fullbody.py   (art-src/jpg/sheet_<id>.jpg 를 읽는다)
from PIL import Image
BOX = {
    "hero_m": (530, 50, 690, 475),       # 생존자 기본복
    "hero_f": (1283, 150, 1405, 520),    # 연구소 복장
    "harin": (1172, 150, 1295, 505),     # 탐험가 복장
    "seoyun": (735, 88, 870, 482), "dokgo": (783, 147, 910, 510), "mira": (1085, 75, 1197, 475),
    "bongsu": (695, 30, 925, 370), "ara": (698, 45, 840, 462), "taeho": (790, 75, 940, 495),
    "seolhwa": (715, 45, 925, 432), "eunbi": (715, 45, 845, 480), "ahyeon": (1203, 45, 1338, 452),
    "soyul": (803, 150, 930, 510), "chaeryeong": (633, 48, 778, 468), "dain": (787, 32, 935, 392),
    "eunsol": (598, 418, 730, 616), "yerin": (633, 40, 778, 472), "mina": (1015, 45, 1138, 465),
}
for k, b in BOX.items():
    im = Image.open(f"art-src/jpg/sheet_{k}.jpg").convert("RGB").crop(b)
    s = 640 / im.height
    im = im.resize((round(im.width * s), 640), Image.LANCZOS)
    im.save(f"assets/heroines/{k}/full.webp", quality=86)
print(len(BOX))
