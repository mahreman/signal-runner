# Signal Runner

Signal Runner, akıcı bir fiyat grafiğinin içinde geçen mobil odaklı bir arcade oyunudur. Oyuncu, parmağıyla hareket ettirdiği küçük bir topu yukarı doğru akan çizgi grafiğinin üzerinde dengede tutmaya çalışır. Grafiğin tepesine yakın seyretmek yüksek skor getirir; çizgiden fazla uzaklaşmak ise enerji barını hızla tüketir.

## Özellikler
- **Gerçek veri** – Oyun açılışında Binance BTC/USDT paritesinin 1 dakikalık son 1000 mum verisi çekilir.
- **Mobil odaklı** – Tam ekran dikey canvas, dokunmatik kontroller ve yumuşak oyuncu hareketi.
- **Çekirdek mekanik** – Oyuncunun x pozisyonu, grafiğin aynı y seviyesindeki ideal x pozisyonuna ne kadar yakınsa o kadar skor kazanır ve enerjisini korur.

## Çalıştırma
1. Depo kökünde basit bir HTTP sunucusu başlatın (örn. `python -m http.server 8000`).
2. Mobil tarayıcıda veya mobil emülasyon modundaki bir masaüstü tarayıcıda `http://localhost:8000` adresine gidin.
3. Veri yüklemesi tamamlandığında "Tap to Start" uyarısı görünecek. Dokunarak koşuyu başlatın.

## Dosya Yapısı
```
signal-runner/
├── index.html          # Tam ekran canvas, modüler script yükleme
├── style.css           # Dikey mobil yerleşim ve HUD stilleri
└── src/
    ├── config.js       # Sabitler (renkler, hızlar, skor/enerji katsayıları)
    ├── binance.js      # Binance kline verisini çekme
    ├── dataTransform.js# Kline → track point dönüşümü
    ├── track.js        # Grafik akışı, çizim ve ideal x hesaplama
    ├── player.js       # Oyuncu topu, enerji ve hareket
    ├── input.js        # Dokunmatik/pointer input toplayıcı
    ├── ui.js           # HUD, enerji barı ve durum overlay’leri
    └── game.js         # Ana döngü, state machine, skor/enerji hesapları
```
