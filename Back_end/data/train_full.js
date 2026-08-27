function formatTime(hours, minutes) {
  const h = Math.floor(hours) % 24;
  const m = Math.floor(minutes);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

const trains = [
  { trainNumber: "12953", trainName: "NDLS TEJAS RAJ EX", source: "NDLS", destination: "BPL", stops: ["NDLS", "GWL", "BPL"], fare: 395, duration: "6:32", availability: 0, dateOfJourney: "2025-10-29",
    stopDetails: [
      { station: "NDLS", arrivalTime: null, departureTime: "06:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "GWL", arrivalTime: "09:16", departureTime: "09:26", cumulativeFare: 198, cumulativeDuration: 196 },
      { station: "BPL", arrivalTime: "12:32", departureTime: null, cumulativeFare: 395, cumulativeDuration: 392 }
    ]
  },
  { trainNumber: "12954", trainName: "BPL SARAIGHAT EXP", source: "BPL", destination: "CNB", stops: ["BPL", "ALD", "CNB"], fare: 318, duration: "5:25", availability: 39, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "BPL", arrivalTime: null, departureTime: "07:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "ALD", arrivalTime: "09:43", departureTime: "09:53", cumulativeFare: 159, cumulativeDuration: 163 },
      { station: "CNB", arrivalTime: "12:25", departureTime: null, cumulativeFare: 318, cumulativeDuration: 325 }
    ]
  },
  { trainNumber: "12955", trainName: "GWL DBRT RAJDHANI", source: "GWL", destination: "LKO", stops: ["GWL", "JHS", "LKO"], fare: 670, duration: "3:42", availability: 60, dateOfJourney: "2025-10-28",
    stopDetails: [
      { station: "GWL", arrivalTime: null, departureTime: "08:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "JHS", arrivalTime: "09:51", departureTime: "10:01", cumulativeFare: 335, cumulativeDuration: 111 },
      { station: "LKO", arrivalTime: "11:42", departureTime: null, cumulativeFare: 670, cumulativeDuration: 222 }
    ]
  },
  { trainNumber: "12956", trainName: "ALD SHATABDI EXPRESS", source: "ALD", destination: "SUR", stops: ["ALD", "MFP", "SUR"], fare: 497, duration: "7:17", availability: 41, dateOfJourney: "2025-10-27",
    stopDetails: [
      { station: "ALD", arrivalTime: null, departureTime: "09:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "MFP", arrivalTime: "12:39", departureTime: "12:49", cumulativeFare: 249, cumulativeDuration: 219 },
      { station: "SUR", arrivalTime: "16:17", departureTime: null, cumulativeFare: 497, cumulativeDuration: 437 }
    ]
  },
  { trainNumber: "12957", trainName: "LKO INDORE EXPRESS", source: "LKO", destination: "JHS", stops: ["LKO", "CNB", "JHS"], fare: 549, duration: "4:09", availability: 13, dateOfJourney: "2025-10-29",
    stopDetails: [
      { station: "LKO", arrivalTime: null, departureTime: "06:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "CNB", arrivalTime: "08:35", departureTime: "08:45", cumulativeFare: 275, cumulativeDuration: 125 },
      { station: "JHS", arrivalTime: "10:39", departureTime: null, cumulativeFare: 549, cumulativeDuration: 249 }
    ]
  },
  { trainNumber: "12958", trainName: "CNB LUCKNOW EXPRESS", source: "CNB", destination: "MFP", stops: ["CNB", "SUR", "MFP"], fare: 445, duration: "5:27", availability: 55, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "CNB", arrivalTime: null, departureTime: "10:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "SUR", arrivalTime: "12:44", departureTime: "12:54", cumulativeFare: 223, cumulativeDuration: 164 },
      { station: "MFP", arrivalTime: "15:27", departureTime: null, cumulativeFare: 445, cumulativeDuration: 327 }
    ]
  },
  { trainNumber: "12959", trainName: "JHS GWL EXPRESS", source: "JHS", destination: "ALD", stops: ["JHS", "NDLS", "ALD"], fare: 401, duration: "4:59", availability: 51, dateOfJourney: "2025-10-25",
    stopDetails: [
      { station: "JHS", arrivalTime: null, departureTime: "07:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "NDLS", arrivalTime: "10:00", departureTime: "10:10", cumulativeFare: 201, cumulativeDuration: 150 },
      { station: "ALD", arrivalTime: "12:29", departureTime: null, cumulativeFare: 401, cumulativeDuration: 299 }
    ]
  },
  { trainNumber: "12960", trainName: "SUR ALD EXPRESS", source: "SUR", destination: "BPL", stops: ["SUR", "LKO", "BPL"], fare: 468, duration: "3:22", availability: 22, dateOfJourney: "2025-10-27",
    stopDetails: [
      { station: "SUR", arrivalTime: null, departureTime: "11:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "LKO", arrivalTime: "12:41", departureTime: "12:51", cumulativeFare: 234, cumulativeDuration: 101 },
      { station: "BPL", arrivalTime: "14:22", departureTime: null, cumulativeFare: 468, cumulativeDuration: 202 }
    ]
  },
  { trainNumber: "12961", trainName: "MFP AGC EXPRESS", source: "MFP", destination: "NDLS", stops: ["MFP", "ALD", "NDLS"], fare: 320, duration: "4:35", availability: 19, dateOfJourney: "2025-10-26",
    stopDetails: [
      { station: "MFP", arrivalTime: null, departureTime: "08:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "ALD", arrivalTime: "10:48", departureTime: "10:58", cumulativeFare: 160, cumulativeDuration: 138 },
      { station: "NDLS", arrivalTime: "13:05", departureTime: null, cumulativeFare: 320, cumulativeDuration: 275 }
    ]
  },
  { trainNumber: "12962", trainName: "NDLS CNB EXPRESS", source: "NDLS", destination: "SUR", stops: ["NDLS", "BPL", "SUR"], fare: 613, duration: "6:13", availability: 44, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "NDLS", arrivalTime: null, departureTime: "12:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "BPL", arrivalTime: "15:07", departureTime: "15:17", cumulativeFare: 307, cumulativeDuration: 187 },
      { station: "SUR", arrivalTime: "18:13", departureTime: null, cumulativeFare: 613, cumulativeDuration: 373 }
    ]
  },
  { trainNumber: "12963", trainName: "BPL JHS EXPRESS", source: "BPL", destination: "JHS", stops: ["BPL", "GWL", "JHS"], fare: 456, duration: "4:28", availability: 36, dateOfJourney: "2025-10-25",
    stopDetails: [
      { station: "BPL", arrivalTime: null, departureTime: "09:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "GWL", arrivalTime: "11:44", departureTime: "11:54", cumulativeFare: 228, cumulativeDuration: 134 },
      { station: "JHS", arrivalTime: "13:58", departureTime: null, cumulativeFare: 456, cumulativeDuration: 268 }
    ]
  },
  { trainNumber: "12964", trainName: "GWL MFP EXPRESS", source: "GWL", destination: "MFP", stops: ["GWL", "SUR", "MFP"], fare: 520, duration: "5:14", availability: 47, dateOfJourney: "2025-10-29",
    stopDetails: [
      { station: "GWL", arrivalTime: null, departureTime: "13:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "SUR", arrivalTime: "15:37", departureTime: "15:47", cumulativeFare: 260, cumulativeDuration: 157 },
      { station: "MFP", arrivalTime: "18:14", departureTime: null, cumulativeFare: 520, cumulativeDuration: 314 }
    ]
  },
  { trainNumber: "12965", trainName: "ALD CNB EXPRESS", source: "ALD", destination: "CNB", stops: ["ALD", "LKO", "CNB"], fare: 360, duration: "3:55", availability: 22, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "ALD", arrivalTime: null, departureTime: "10:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "LKO", arrivalTime: "12:28", departureTime: "12:38", cumulativeFare: 180, cumulativeDuration: 118 },
      { station: "CNB", arrivalTime: "14:25", departureTime: null, cumulativeFare: 360, cumulativeDuration: 235 }
    ]
  },
  { trainNumber: "12966", trainName: "LKO NDLS EXPRESS", source: "LKO", destination: "NDLS", stops: ["LKO", "AGC", "NDLS"], fare: 410, duration: "4:04", availability: 38, dateOfJourney: "2025-10-27",
    stopDetails: [
      { station: "LKO", arrivalTime: null, departureTime: "14:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "AGC", arrivalTime: "16:02", departureTime: "16:12", cumulativeFare: 205, cumulativeDuration: 122 },
      { station: "NDLS", arrivalTime: "18:04", departureTime: null, cumulativeFare: 410, cumulativeDuration: 244 }
    ]
  },
  { trainNumber: "12967", trainName: "CNB SUR EXPRESS", source: "CNB", destination: "SUR", stops: ["CNB", "JHS", "SUR"], fare: 455, duration: "5:20", availability: 43, dateOfJourney: "2025-10-28",
    stopDetails: [
      { station: "CNB", arrivalTime: null, departureTime: "11:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "JHS", arrivalTime: "14:10", departureTime: "14:20", cumulativeFare: 228, cumulativeDuration: 160 },
      { station: "SUR", arrivalTime: "16:50", departureTime: null, cumulativeFare: 455, cumulativeDuration: 320 }
    ]
  },
  { trainNumber: "12968", trainName: "JHS ALD EXPRESS", source: "JHS", destination: "ALD", stops: ["JHS", "BPL", "ALD"], fare: 380, duration: "3:32", availability: 27, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "JHS", arrivalTime: null, departureTime: "15:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "BPL", arrivalTime: "16:46", departureTime: "16:56", cumulativeFare: 190, cumulativeDuration: 106 },
      { station: "ALD", arrivalTime: "18:32", departureTime: null, cumulativeFare: 380, cumulativeDuration: 212 }
    ]
  },
  { trainNumber: "12969", trainName: "SUR BPL EXPRESS", source: "SUR", destination: "BPL", stops: ["SUR", "MFP", "BPL"], fare: 465, duration: "4:48", availability: 25, dateOfJourney: "2025-10-26",
    stopDetails: [
      { station: "SUR", arrivalTime: null, departureTime: "12:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "MFP", arrivalTime: "14:54", departureTime: "15:04", cumulativeFare: 233, cumulativeDuration: 144 },
      { station: "BPL", arrivalTime: "17:18", departureTime: null, cumulativeFare: 465, cumulativeDuration: 288 }
    ]
  },
  { trainNumber: "12970", trainName: "MFP GWL EXPRESS", source: "MFP", destination: "GWL", stops: ["MFP", "JHS", "GWL"], fare: 430, duration: "4:02", availability: 48, dateOfJourney: "2025-10-29",
    stopDetails: [
      { station: "MFP", arrivalTime: null, departureTime: "16:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "JHS", arrivalTime: "18:01", departureTime: "18:11", cumulativeFare: 215, cumulativeDuration: 121 },
      { station: "GWL", arrivalTime: "20:02", departureTime: null, cumulativeFare: 430, cumulativeDuration: 242 }
    ]
  },
  { trainNumber: "12971", trainName: "NDLS LKO EXPRESS", source: "NDLS", destination: "LKO", stops: ["NDLS", "AGC", "LKO"], fare: 550, duration: "5:10", availability: 50, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "NDLS", arrivalTime: null, departureTime: "13:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "AGC", arrivalTime: "16:05", departureTime: "16:15", cumulativeFare: 275, cumulativeDuration: 155 },
      { station: "LKO", arrivalTime: "18:40", departureTime: null, cumulativeFare: 550, cumulativeDuration: 310 }
    ]
  },
  { trainNumber: "12972", trainName: "BPL AGC EXPRESS", source: "BPL", destination: "AGC", stops: ["BPL", "LKO", "AGC"], fare: 330, duration: "3:40", availability: 31, dateOfJourney: "2025-10-27",
    stopDetails: [
      { station: "BPL", arrivalTime: null, departureTime: "17:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "LKO", arrivalTime: "18:50", departureTime: "19:00", cumulativeFare: 165, cumulativeDuration: 110 },
      { station: "AGC", arrivalTime: "20:40", departureTime: null, cumulativeFare: 330, cumulativeDuration: 220 }
    ]
  },
  { trainNumber: "12973", trainName: "GWL SUR EXPRESS", source: "GWL", destination: "SUR", stops: ["GWL", "MFP", "SUR"], fare: 525, duration: "5:30", availability: 36, dateOfJourney: "2025-10-26",
    stopDetails: [
      { station: "GWL", arrivalTime: null, departureTime: "14:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "MFP", arrivalTime: "17:15", departureTime: "17:25", cumulativeFare: 263, cumulativeDuration: 165 },
      { station: "SUR", arrivalTime: "20:00", departureTime: null, cumulativeFare: 525, cumulativeDuration: 330 }
    ]
  },
  { trainNumber: "12974", trainName: "ALD BPL EXPRESS", source: "ALD", destination: "BPL", stops: ["ALD", "CNB", "BPL"], fare: 410, duration: "4:00", availability: 44, dateOfJourney: "2025-10-29",
    stopDetails: [
      { station: "ALD", arrivalTime: null, departureTime: "18:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "CNB", arrivalTime: "20:00", departureTime: "20:10", cumulativeFare: 205, cumulativeDuration: 120 },
      { station: "BPL", arrivalTime: "22:00", departureTime: null, cumulativeFare: 410, cumulativeDuration: 240 }
    ]
  },
  { trainNumber: "12975", trainName: "LKO MFP EXPRESS", source: "LKO", destination: "MFP", stops: ["LKO", "JHS", "MFP"], fare: 480, duration: "5:09", availability: 20, dateOfJourney: "2025-10-25",
    stopDetails: [
      { station: "LKO", arrivalTime: null, departureTime: "15:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "JHS", arrivalTime: "18:05", departureTime: "18:15", cumulativeFare: 240, cumulativeDuration: 155 },
      { station: "MFP", arrivalTime: "20:39", departureTime: null, cumulativeFare: 480, cumulativeDuration: 309 }
    ]
  },
  { trainNumber: "12976", trainName: "CNB NDLS EXPRESS", source: "CNB", destination: "NDLS", stops: ["CNB", "AGC", "NDLS"], fare: 360, duration: "3:30", availability: 28, dateOfJourney: "2025-10-28",
    stopDetails: [
      { station: "CNB", arrivalTime: null, departureTime: "19:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "AGC", arrivalTime: "20:45", departureTime: "20:55", cumulativeFare: 180, cumulativeDuration: 105 },
      { station: "NDLS", arrivalTime: "22:30", departureTime: null, cumulativeFare: 360, cumulativeDuration: 210 }
    ]
  },
  { trainNumber: "12977", trainName: "JHS LKO EXPRESS", source: "JHS", destination: "LKO", stops: ["JHS", "BPL", "LKO"], fare: 410, duration: "4:05", availability: 39, dateOfJourney: "2025-10-27",
    stopDetails: [
      { station: "JHS", arrivalTime: null, departureTime: "16:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "BPL", arrivalTime: "18:33", departureTime: "18:43", cumulativeFare: 205, cumulativeDuration: 123 },
      { station: "LKO", arrivalTime: "20:35", departureTime: null, cumulativeFare: 410, cumulativeDuration: 245 }
    ]
  },
  { trainNumber: "12978", trainName: "SUR CNB EXPRESS", source: "SUR", destination: "CNB", stops: ["SUR", "MFP", "CNB"], fare: 440, duration: "4:45", availability: 32, dateOfJourney: "2025-10-25",
    stopDetails: [
      { station: "SUR", arrivalTime: null, departureTime: "20:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "MFP", arrivalTime: "22:23", departureTime: "22:33", cumulativeFare: 220, cumulativeDuration: 143 },
      { station: "CNB", arrivalTime: "00:45", departureTime: null, cumulativeFare: 440, cumulativeDuration: 285 }
    ]
  },
  { trainNumber: "12979", trainName: "MFP JHS EXPRESS", source: "MFP", destination: "JHS", stops: ["MFP", "ALD", "JHS"], fare: 370, duration: "3:50", availability: 46, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "MFP", arrivalTime: null, departureTime: "17:30", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "ALD", arrivalTime: "19:25", departureTime: "19:35", cumulativeFare: 185, cumulativeDuration: 115 },
      { station: "JHS", arrivalTime: "21:20", departureTime: null, cumulativeFare: 370, cumulativeDuration: 230 }
    ]
  },
  { trainNumber: "12980", trainName: "NDLS SUR EXPRESS", source: "NDLS", destination: "SUR", stops: ["NDLS", "BPL", "SUR"], fare: 495, duration: "5:55", availability: 42, dateOfJourney: "2025-10-25",
    stopDetails: [
      { station: "NDLS", arrivalTime: null, departureTime: "06:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "BPL", arrivalTime: "08:58", departureTime: "09:08", cumulativeFare: 248, cumulativeDuration: 178 },
      { station: "SUR", arrivalTime: "11:55", departureTime: null, cumulativeFare: 495, cumulativeDuration: 355 }
    ]
  },
  { trainNumber: "12981", trainName: "BPL GWL EXPRESS", source: "BPL", destination: "GWL", stops: ["BPL", "CNB", "GWL"], fare: 375, duration: "4:15", availability: 35, dateOfJourney: "2025-10-28",
    stopDetails: [
      { station: "BPL", arrivalTime: null, departureTime: "07:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "CNB", arrivalTime: "09:08", departureTime: "09:18", cumulativeFare: 188, cumulativeDuration: 128 },
      { station: "GWL", arrivalTime: "11:15", departureTime: null, cumulativeFare: 375, cumulativeDuration: 255 }
    ]
  },
  { trainNumber: "12982", trainName: "GWL ALD EXPRESS", source: "GWL", destination: "ALD", stops: ["GWL", "JHS", "ALD"], fare: 400, duration: "4:30", availability: 30, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "GWL", arrivalTime: null, departureTime: "08:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "JHS", arrivalTime: "10:15", departureTime: "10:25", cumulativeFare: 200, cumulativeDuration: 135 },
      { station: "ALD", arrivalTime: "12:30", departureTime: null, cumulativeFare: 400, cumulativeDuration: 270 }
    ]
  },
  { trainNumber: "12983", trainName: "ALD NDLS EXPRESS", source: "ALD", destination: "NDLS", stops: ["ALD", "LKO", "NDLS"], fare: 350, duration: "3:25", availability: 29, dateOfJourney: "2025-10-27",
    stopDetails: [
      { station: "ALD", arrivalTime: null, departureTime: "09:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "LKO", arrivalTime: "10:43", departureTime: "10:53", cumulativeFare: 175, cumulativeDuration: 103 },
      { station: "NDLS", arrivalTime: "12:25", departureTime: null, cumulativeFare: 350, cumulativeDuration: 205 }
    ]
  },
  { trainNumber: "12984", trainName: "LKO BPL EXPRESS", source: "LKO", destination: "BPL", stops: ["LKO", "CNB", "BPL"], fare: 460, duration: "4:50", availability: 40, dateOfJourney: "2025-10-29",
    stopDetails: [
      { station: "LKO", arrivalTime: null, departureTime: "10:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "CNB", arrivalTime: "12:25", departureTime: "12:35", cumulativeFare: 230, cumulativeDuration: 145 },
      { station: "BPL", arrivalTime: "14:50", departureTime: null, cumulativeFare: 460, cumulativeDuration: 290 }
    ]
  },
  { trainNumber: "12985", trainName: "CNB MFP EXPRESS", source: "CNB", destination: "MFP", stops: ["CNB", "SUR", "MFP"], fare: 430, duration: "4:45", availability: 25, dateOfJourney: "2025-10-24",
    stopDetails: [
      { station: "CNB", arrivalTime: null, departureTime: "11:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "SUR", arrivalTime: "13:23", departureTime: "13:33", cumulativeFare: 215, cumulativeDuration: 143 },
      { station: "MFP", arrivalTime: "15:45", departureTime: null, cumulativeFare: 430, cumulativeDuration: 285 }
    ]
  },
  { trainNumber: "12986", trainName: "JHS ALD EXPRESS", source: "JHS", destination: "ALD", stops: ["JHS", "NDLS", "ALD"], fare: 390, duration: "3:50", availability: 24, dateOfJourney: "2025-10-30",
    stopDetails: [
      { station: "JHS", arrivalTime: null, departureTime: "12:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "NDLS", arrivalTime: "13:55", departureTime: "14:05", cumulativeFare: 195, cumulativeDuration: 115 },
      { station: "ALD", arrivalTime: "15:50", departureTime: null, cumulativeFare: 390, cumulativeDuration: 230 }
    ]
  },
  { trainNumber: "12987", trainName: "SUR LKO EXPRESS", source: "SUR", destination: "LKO", stops: ["SUR", "JHS", "LKO"], fare: 520, duration: "5:35", availability: 41, dateOfJourney: "2025-10-26",
    stopDetails: [
      { station: "SUR", arrivalTime: null, departureTime: "13:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "JHS", arrivalTime: "15:48", departureTime: "15:58", cumulativeFare: 260, cumulativeDuration: 168 },
      { station: "LKO", arrivalTime: "18:35", departureTime: null, cumulativeFare: 520, cumulativeDuration: 335 }
    ]
  },
  { trainNumber: "12988", trainName: "MFP BPL EXPRESS", source: "MFP", destination: "BPL", stops: ["MFP", "CNB", "BPL"], fare: 515, duration: "5:18", availability: 45, dateOfJourney: "2025-10-29",
    stopDetails: [
      { station: "MFP", arrivalTime: null, departureTime: "14:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "CNB", arrivalTime: "16:39", departureTime: "16:49", cumulativeFare: 258, cumulativeDuration: 159 },
      { station: "BPL", arrivalTime: "19:18", departureTime: null, cumulativeFare: 515, cumulativeDuration: 318 }
    ]
  },
  { trainNumber: "12989", trainName: "NDLS GWL EXPRESS", source: "NDLS", destination: "GWL", stops: ["NDLS", "AGC", "GWL"], fare: 375, duration: "3:47", availability: 19, dateOfJourney: "2025-10-25",
    stopDetails: [
      { station: "NDLS", arrivalTime: null, departureTime: "15:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "AGC", arrivalTime: "16:54", departureTime: "17:04", cumulativeFare: 188, cumulativeDuration: 114 },
      { station: "GWL", arrivalTime: "18:47", departureTime: null, cumulativeFare: 375, cumulativeDuration: 227 }
    ]
  },
  { trainNumber: "12990", trainName: "BPL SUR EXPRESS", source: "BPL", destination: "SUR", stops: ["BPL", "LKO", "SUR"], fare: 485, duration: "4:58", availability: 33, dateOfJourney: "2025-10-27",
    stopDetails: [
      { station: "BPL", arrivalTime: null, departureTime: "16:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "LKO", arrivalTime: "18:29", departureTime: "18:39", cumulativeFare: 243, cumulativeDuration: 149 },
      { station: "SUR", arrivalTime: "20:58", departureTime: null, cumulativeFare: 485, cumulativeDuration: 298 }
    ]
  },
  { trainNumber: "12991", trainName: "BPL JHS EXPRESS", source: "JHS", destination: "BPL", stops: ["JHS", "GWL", "BPL"], fare: 300, duration: "3:00", availability: 5, dateOfJourney: "2025-10-25",
    stopDetails: [
      { station: "JHS", arrivalTime: null, departureTime: "17:00", cumulativeFare: 0, cumulativeDuration: 0 },
      { station: "GWL", arrivalTime: "18:30", departureTime: "18:40", cumulativeFare: 150, cumulativeDuration: 90 },
      { station: "BPL", arrivalTime: "20:00", departureTime: null, cumulativeFare: 300, cumulativeDuration: 180 }
    ]
  }
];

module.exports = trains;
