#include <FastBot.h>
#include <LiquidCrystal_I2C.h> 

#define BOT_TOKEN   "8180688969:AAECmyq0DcZ0JaL2lLTtUE1zCQjLaaGgWPQ"
#define CHAT_ID     "7861551150"
#define WIFI_SSID   "4L13F"
#define WIFI_PASS   "aliefgtr123"

LiquidCrystal_I2C lcd(0x27, 16, 2);
FastBot bot(BOT_TOKEN);

const int trigP = D5;
const int echoP = D6;
#define pump D7
#define tdsPin A0

// TDS Meter Calibration Values
#define TDS_CALIBRATION_FACTOR 0.5

#define SOUND_VELOCITY 0.034  // cm/us

boolean mode;
boolean stPump;
boolean f_oto;
boolean f_man;
boolean fFull;

// Variabel pengukuran
long duration, vol;
long radius = 8.8 / 2;
long height = 24.5;
long volumeTabung = 3.14 * radius * radius * height;


//long La_silinder, PxL_balok;
long T_sensor, T_air;
int distance;
int isiUlang;
String stPUMP;
String stMode;

// =============================
// Fungsi: Baca Jarak Air
// =============================
// void getLevel() {
//     digitalWrite(trigP, LOW);
//     delayMicroseconds(2);
//     digitalWrite(trigP, HIGH);
//     delayMicroseconds(10);
//     digitalWrite(trigP, LOW);

//     duration = pulseIn(echoP, HIGH);
//     distance = duration * SOUND_VELOCITY / 2;
//     Serial.println(distance);
//     // T_air = T_sensor - distance;
//     T_air = height - distance;
// }

void getLevel() {
    digitalWrite(trigP, LOW);
    delayMicroseconds(2);
    digitalWrite(trigP, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigP, LOW);

    duration = pulseIn(echoP, HIGH);
    distance = duration * SOUND_VELOCITY / 2;
    Serial.println(distance);  // Debugging jarak

    // Menghitung volume berdasarkan jarak
    long heightRemaining = height - distance; // Sisa tinggi air dalam cm
    vol = (3.14 * radius * radius * heightRemaining) / 1000; // Menghitung volume dalam liter
}


// =============================
// Fungsi: Baca TDS Meter
// =============================
int readTDS() {
    int rawValue = analogRead(tdsPin);    
    int tdsValue = rawValue * TDS_CALIBRATION_FACTOR;
    return tdsValue;
}

// =============================
// Fungsi: Handle Pesan Telegram
// =============================
void newMsg(FB_msg &msg) {
    if (msg.text == "/Get") {
        getLevel();
        int tdsValue = readTDS();  // Baca nilai TDS
        stPUMP = stPump ? "ON" : "OFF";
        stMode = mode ? "Otomatis" : "Manual";

        Serial.println("------> Kirim data sensor ke Telegram");

        String data_sensor = "Smart Volume Tandon :\n";
        data_sensor += "- Volume  = " + String(vol) + " Lt\n";
        data_sensor += "- Mode    = " + stMode + "\n";
        data_sensor += "- Pompa   = " + stPUMP + "\n";
        data_sensor += "- TDS     = " + String(tdsValue) + " ppm\n"; // Tambahkan TDS ke pesan
        data_sensor += "-------------------------------\n";
        data_sensor += "Format ganti Mode:\n";
        data_sensor += "- /Otomatis\n";
        data_sensor += "- /Manual\n";
        data_sensor += "-------------------------------\n";
        data_sensor += "Request data: /Get\n";

        bot.sendMessage(data_sensor);
        lcd.setCursor(0, 1);
        lcd.print("kirim data....");
        delay(1000);
    } else if (msg.text == "/start") {
        lcd.clear();
        lcd.print("pesan masuk");
        lcd.setCursor(0, 1);
        lcd.print(msg.text);

        String welcome = "Volume Tandon sudah siap!\n";
        welcome += "-------------------------\n";
        welcome += "Request data /Get\n";
        welcome += "Mode manual, hidupkan pompa /Pump_ON\n";
        welcome += "Ganti mode /Otomatis\n";
        welcome += "-------------------------\n";

        bot.sendMessage(welcome);
        delay(2000);
    } else if (msg.text == "/Otomatis") {
        bot.sendMessage("Mode Otomatis aktif");
        mode = true;
        f_oto = false;
        f_man = false;
        isiUlang = 0;
        delay(2000);
    } else if (msg.text == "/Manual") {
        mode = false;
        f_oto = false;
        f_man = false;
        stPump = false;

        String pesan = "Mode Manual aktif,\n";
        pesan += "Hidupkan pompa /Pump_ON\n";
        bot.sendMessage(pesan);
    } else if (msg.text == "/Pump_ON" && !mode) {
        stPump = true;
    } else if (msg.text == "/Pump_OFF" && !mode) {
        stPump = false;
    } else {
        lcd.clear();
        lcd.print("Format Salah!");
        lcd.setCursor(0, 1);
        lcd.print(msg.text);
        bot.sendMessage("Format Salah!");
        delay(5000);
    }
}

// =============================
// Fungsi: Hidupkan Pompa
// =============================
void pumpOn() {
    digitalWrite(pump, LOW);
    lcd.setCursor(9, 1);
    lcd.print("ON      ");
}

// =============================
// Fungsi: Matikan Pompa
// =============================
void pumpOff() {
    digitalWrite(pump, HIGH);
    lcd.setCursor(9, 1);
    lcd.print("OFF     ");
}

// =============================
// Fungsi: Koneksi ke WiFi
// =============================
void connectWiFi() {
    delay(2000);
    Serial.begin(115200);
    Serial.println();

    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        if (millis() > 15000) ESP.restart();
    }
    Serial.println("Connected");
}

// =============================
// Fungsi: Setup Awal
// =============================
void setup() {
    T_sensor = 30;        // tinggi dari dasar ke sensor
    // La_silinder = 8;      // luas alas tabung (cm²)
    // PxL_balok = 5000;     // luas alas balok (jika digunakan)

    Serial.begin(115200);
    pinMode(trigP, OUTPUT);
    pinMode(echoP, INPUT);
    pinMode(pump, OUTPUT);
    pinMode(tdsPin, INPUT);  // Pin untuk TDS meter
    digitalWrite(pump, HIGH);

    lcd.begin(16, 2);
    lcd.init();
    lcd.backlight();
    lcd.clear();
    lcd.print(" Volume Tandon");
    lcd.setCursor(0, 1);
    lcd.print(" Telegram IoT");
    delay(3000);

    lcd.clear();
    lcd.print("Tunggu Koneksi..");
    Serial.println();

    connectWiFi();

    bot.setChatID(CHAT_ID);
    bot.attach(newMsg);

    String welcome = "Water Level Monitoring System - Kelompok 8!\n";
    welcome += "--------------------------------------\n";
    welcome += "Informasi Sensor: /Get\n";
    welcome += "Mode manual, hidupkan pompa /Pump_ON\n";
    welcome += "Ganti mode /Otomatis\n";
    welcome += "--------------------------------------\n";

    bot.sendMessage(welcome);

    lcd.clear();
    lcd.print("Koneksi Sukses !");
    delay(3000);
    lcd.clear();
    lcd.print("Oto");
    lcd.setCursor(4, 0);
    lcd.print("Vol :");
    lcd.setCursor(4, 1);
    lcd.print("Pump:");
    delay(100);
}

// =============================
// Fungsi: Loop Utama
// =============================
void loop() {
    bot.tick();
    getLevel();

    if (T_air > 0) {
        //vol = PxL_balok * T_air;   // Ganti ke La_silinder jika pakai tabung
        //vol = vol / 1000;
        vol = (3.14 * radius * radius * T_air) / 1000;
    } else {
        vol = 0;
    }

    lcd.setCursor(9, 0);
    lcd.print(vol);
    lcd.print(" Ml     ");

    int tdsValue = readTDS();  // Baca nilai TDS dari sensor
    lcd.setCursor(9, 1);
    lcd.print("TDS: ");
    lcd.print(tdsValue);  // Tampilkan TDS di LCD

    if (mode) {  // Mode otomatis
        lcd.setCursor(0, 0);
        lcd.print("OTO");

        if (vol <= 750 && fFull) {
            fFull = false;
            isiUlang++;
            bot.sendMessage("Pengisian ulang ke-" + String(isiUlang));
        } else if (vol <= 950 && !fFull) {
            pumpOn();
            stPump = false;

            if (!f_oto && isiUlang == 0) {
                bot.sendMessage("Pengisian otomatis dimulai, pompa ON");
                f_oto = true;
            }
        } else {
            pumpOff();
            stPump = true;

            if (f_oto) {
                String pesan = "Pengisian otomatis selesai, pompa OFF\n";
                pesan += "Pompa akan hidup kembali jika volume < 750 lt";
                bot.sendMessage(pesan);
                f_oto = false;
            }
            fFull = true;
        }
    } else {  // Mode manual
        lcd.setCursor(0, 0);
        lcd.print("MAN Vol :");
        lcd.setCursor(0, 1);
        lcd.print("    Pump:");

        if (stPump) {
            pumpOn();
            if (!f_man) {
                String pesan = "Pengisian dimulai, pompa ON\n";
                pesan += "Matikan pompa: /Pump_OFF";
                bot.sendMessage(pesan);
                f_man = true;
            }
        } else {
            pumpOff();
            if (f_man) {
                String pesan = "Pengisian berhenti, pompa OFF\n";
                pesan += "Hidupkan pompa: /Pump_ON";
                bot.sendMessage(pesan);
                f_man = false;
            }
        }
    }

    delay(1000);
}