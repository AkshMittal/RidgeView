const peaks  = {
  "Himalaya": [
    { name: "Mount Everest", height: 8848, coords: [27.9881, 86.9250] },
    { name: "Kangchenjunga", height: 8586, coords: [27.7025, 88.1475] },
    { name: "Lhotse", height: 8516, coords: [27.9617, 86.9330] },
    { name: "Makalu", height: 8485, coords: [27.8897, 87.0883] },
    { name: "Cho Oyu", height: 8188, coords: [28.0940, 86.6600] },
    { name: "Dhaulagiri I", height: 8167, coords: [28.6967, 83.4878] },
    { name: "Manaslu", height: 8163, coords: [28.5497, 84.5617] },
    { name: "Nanga Parbat", height: 8126, coords: [35.2372, 74.5892] },
    { name: "Annapurna I", height: 8091, coords: [28.5958, 83.8203] },
    { name: "Shishapangma", height: 8027, coords: [28.3530, 85.7790] },
    { name: "Ama Dablam", height: 6812, coords: [27.8613, 86.8615] },
    { name: "Mera Peak", height: 6476, coords: [27.6970, 86.8690] },
    { name: "Island Peak (Imja Tse)", height: 6189, coords: [27.9247, 86.9375] },
    { name: "Lobuche East", height: 6119, coords: [27.9480, 86.8040] },
    { name: "Gokyo Ri", height: 5357, coords: [27.9550, 86.6950] },
    { name: "Kedarnath Dome", height: 6831, coords: [30.7350, 79.0280] },
    { name: "Trisul", height: 7120, coords: [30.3040, 79.7690] },
    { name: "Nanda Devi", height: 7816, coords: [30.3750, 79.9700] },
    { name: "Kamet", height: 7756, coords: [30.9230, 79.5960] },
    { name: "Hardeol", height: 7151, coords: [30.4940, 80.1450] },
    { name: "Panchachuli II", height: 6904, coords: [30.0100, 80.2520] },
    { name: "Thamserku", height: 6623, coords: [27.8660, 86.7920] },
    { name: "Langtang Lirung", height: 7227, coords: [28.2110, 85.5230] },
    { name: "Bhagirathi II", height: 6512, coords: [30.7550, 79.0950] }
  ],

  "Karakoram": [
    { name: "K2", height: 8611, coords: [35.8808, 76.5158] },
    { name: "Broad Peak", height: 8051, coords: [35.8120, 76.5650] },
    { name: "Gasherbrum I", height: 8080, coords: [35.7242, 76.6960] },
    { name: "Gasherbrum II", height: 8035, coords: [35.7580, 76.6530] },
    { name: "Masherbrum", height: 7821, coords: [35.6330, 76.3320] },
    { name: "Baltoro Kangri", height: 7315, coords: [35.6900, 76.5100] },
    { name: "Trango Towers (Great Trango)", height: 6286, coords: [35.7580, 75.7390] },
    { name: "Sia Kangri", height: 7422, coords: [35.4700, 76.9100] },
    { name: "Chogolisa", height: 7665, coords: [35.4100, 76.5800] }
  ],

  "Hindu Kush & Pamir": [
    { name: "Tirich Mir", height: 7708, coords: [36.2540, 71.8290] },
    { name: "Noshaq", height: 7492, coords: [36.4360, 71.2080] },
    { name: "Ismoil Somoni Peak", height: 7495, coords: [38.9470, 72.1110] },
    { name: "Korzhenevskaya Peak", height: 7105, coords: [38.9440, 72.5420] }
  ],

  "Tian Shan": [
    { name: "Jengish Chokusu (Victory Peak)", height: 7439, coords: [42.1050, 80.1330] },
    { name: "Khan Tengri", height: 7010, coords: [42.2030, 80.2000] }
  ],

  "Alps": [
    { name: "Mont Blanc", height: 4808, coords: [45.8326, 6.8652] },
    { name: "Matterhorn", height: 4478, coords: [45.9763, 7.6586] },
    { name: "Monte Rosa (Dufourspitze)", height: 4637, coords: [45.9369, 7.8670] },
    { name: "Dom", height: 4545, coords: [46.0943, 7.8624] },
    { name: "Weisshorn", height: 4506, coords: [46.0830, 7.6510] },
    { name: "Grand Combin", height: 4314, coords: [45.9410, 7.2870] },
    { name: "Eiger", height: 3967, coords: [46.5775, 8.0050] },
    { name: "Jungfrau", height: 4158, coords: [46.5465, 7.9625] },
    { name: "Monch", height: 4107, coords: [46.5580, 7.9850] },
    { name: "Aiguille du Midi", height: 3842, coords: [45.8810, 6.8870] }
  ],

  "Dolomites": [
    { name: "Marmolada", height: 3343, coords: [46.4330, 11.8670] },
    { name: "Tre Cime di Lavaredo (Cima Grande)", height: 2999, coords: [46.6187, 12.3017] },
    { name: "Tofana di Rozes", height: 3225, coords: [46.5340, 12.0400] },
    { name: "Sella (Piz Boè)", height: 3152, coords: [46.4980, 11.8370] },
    { name: "Seceda (Monte Fermeda area)", height: 2518, coords: [46.6140, 11.7360] }
  ],

  "Pyrenees": [
    { name: "Aneto", height: 3404, coords: [42.6310, 0.6570] },
    { name: "Vignemale", height: 3298, coords: [42.7740, -0.1430] },
    { name: "Pic du Midi d'Ossau", height: 2884, coords: [42.8000, -0.4420] },
    { name: "Monte Perdido", height: 3355, coords: [42.6750, 0.0350] }
  ],

  "Caucasus": [
    { name: "Mount Elbrus", height: 5642, coords: [43.3499, 42.4453] },
    { name: "Kazbek", height: 5033, coords: [42.6960, 44.5190] },
    { name: "Ushba", height: 4710, coords: [43.1320, 41.9050] },
    { name: "Dykh-Tau", height: 5205, coords: [43.0500, 43.1420] }
  ],

  "Andes (Peru/Bolivia/Chile/Argentina)": [
    { name: "Aconcagua", height: 6961, coords: [-32.6532, -70.0109] },
    { name: "Ojos del Salado", height: 6893, coords: [-27.1090, -68.5410] },
    { name: "Huascarán", height: 6768, coords: [-9.1190, -77.6050] },
    { name: "Alpamayo", height: 5947, coords: [-8.9760, -77.6400] },
    { name: "Ausangate", height: 6384, coords: [-13.7890, -71.2170] },
    { name: "Illimani", height: 6438, coords: [-16.6540, -67.7860] },
    { name: "Fitz Roy (Cerro Chaltén)", height: 3405, coords: [-49.2700, -73.0440] },
    { name: "Cerro Torre", height: 3133, coords: [-49.2990, -73.0860] },
    { name: "Licancabur", height: 5920, coords: [-22.8340, -67.8850] }
  ],

  "Rockies (USA/Canada)": [
    { name: "Mount Elbert", height: 4401, coords: [39.1178, -106.4454] },
    { name: "Longs Peak", height: 4346, coords: [40.2549, -105.6160] },
    { name: "Pikes Peak", height: 4302, coords: [38.8409, -105.0423] },
    { name: "Grand Teton", height: 4199, coords: [43.7410, -110.8020] },
    { name: "Mount Robson", height: 3954, coords: [53.1100, -119.1500] },
    { name: "Mount Assiniboine", height: 3618, coords: [50.8680, -115.6520] },
    { name: "Maroon Bells (Maroon Peak)", height: 4317, coords: [39.0708, -106.9890] },
    { name: "Mount Sneffels", height: 4315, coords: [38.0039, -107.7925] }
  ],

  "Alaska & Yukon": [
    { name: "Denali", height: 6190, coords: [63.0695, -151.0074] },
    { name: "Mount Foraker", height: 5304, coords: [62.9610, -151.3990] },
    { name: "Mount Saint Elias", height: 5489, coords: [60.2950, -140.9280] }
  ],

  "Cascades & Sierra Nevada": [
    { name: "Mount Rainier", height: 4392, coords: [46.8523, -121.7603] },
    { name: "Mount Shasta", height: 4322, coords: [41.4092, -122.1944] },
    { name: "Mount Hood", height: 3429, coords: [45.3735, -121.6959] },
    { name: "Mount Whitney", height: 4421, coords: [36.5786, -118.2919] },
    { name: "Half Dome", height: 2695, coords: [37.7459, -119.5332] }
  ],

  "Appalachians": [
    { name: "Mount Washington", height: 1917, coords: [44.2706, -71.3033] },
    { name: "Mount Mitchell", height: 2037, coords: [35.7650, -82.2650] }
  ],

  "Atlas (High Atlas, Morocco)": [
    { name: "Jebel Toubkal", height: 4167, coords: [31.0629, -7.9187] },
    { name: "Ouanoukrim", height: 4089, coords: [31.0260, -7.9620] }
  ],

  "Drakensberg": [
    { name: "Mafadi", height: 3450, coords: [-29.2090, 29.3670] },
    { name: "Champagne Castle", height: 3377, coords: [-29.1430, 29.3490] },
    { name: "Cathedral Peak", height: 3004, coords: [-28.9460, 29.2090] }
  ],

  "Southern Alps (New Zealand)": [
    { name: "Aoraki / Mount Cook", height: 3724, coords: [-43.5950, 170.1410] },
    { name: "Mount Aspiring / Tititea", height: 3033, coords: [-44.3830, 168.7330] },
    { name: "Sealy Tarns Ridge (Sealy Range high point)", height: 1531, coords: [-43.7350, 170.0660] }
  ],

  "Japanese Alps": [
    { name: "Mount Fuji", height: 3776, coords: [35.3606, 138.7274] },
    { name: "Mount Kita", height: 3193, coords: [35.6670, 138.2380] },
    { name: "Mount Hotaka (Okuhotaka)", height: 3190, coords: [36.2910, 137.6460] },
    { name: "Mount Yari", height: 3180, coords: [36.3380, 137.6470] }
  ],

  "Indonesia (select volcanoes)": [
    { name: "Mount Rinjani", height: 3726, coords: [-8.4110, 116.4570] },
    { name: "Mount Semeru", height: 3676, coords: [-8.1080, 112.9220] },
    { name: "Mount Bromo", height: 2329, coords: [-7.9425, 112.9530] }
  ]
};
