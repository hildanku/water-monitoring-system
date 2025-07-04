#include <FastBot.h>
#include <LiquidCrystal_I2C.h> 
#include <ESPSupabase.h>

#define BOT_TOKEN   ""
#define CHAT_ID     ""
#define WIFI_SSID   "Akatomo"
#define WIFI_PASS   "akatomo12"

LiquidCrystal_I2C lcd(0x27, 16, 2);
FastBot bot(BOT_TOKEN);
Supabase db;

const int trigP = D5;
const int echoP = D6;
#define pump D7
#define tdsPin D8

const char* supabaseUrl = "";
const char* supabaseKey = "";

#define SOUND_VELOCITY 0.034  // cm/us
#define TDS_CALIBRATION_FACTOR 0.5
// Variabel kontrol
boolean mode;
boolean stPump;
boolean f_oto;
boolean f_man;
boolean fFull;

// Variabel pengukuran
long duration;
float vol;
long La_silinder, PxL_balok;
long T_sensor, T_air;
int distance;
int isiUlang;
String stPUMP;
String stMode;

// =============================
// Fungsi: Baca Jarak Air
// =============================
void getLevel() {
    digitalWrite(trigP, LOW);
    delayMicroseconds(2);
    digitalWrite(trigP, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigP, LOW);

    duration = pulseIn(echoP, HIGH);
    distance = duration * SOUND_VELOCITY / 2;
    T_air = T_sensor - distance;
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
// Fungsi: Logging ke Supabase
// =============================
void logToSupabase(float volume, int tds) {
    String jsonPayload = "{";
    jsonPayload += "\"volume_liter\":" + String(volume, 3) + ",";
    jsonPayload += "\"tds_ppm\":" + String(tds);
    jsonPayload += "}";
  
    Serial.println("[Supabase] Sending: " + jsonPayload);
    
    int res = db.insert("log_level_air", jsonPayload, false);
  
    Serial.print("[Supabase] Response Code: ");
    Serial.println(res);
}

void logEventToSupabase(boolean pump_status, String mode, int isi_ulang_ke, String log_level, String event_message) {
    String jsonPayload = "{";
    jsonPayload += "\"pump_status\":\"" + String(pump_status ? "ON" : "OFF") + "\",";
    jsonPayload += "\"mode\":\"" + String(mode) + "\",";
    jsonPayload += "\"isi_ulang_ke\":" + String(isi_ulang_ke) + ",";
    jsonPayload += "\"log_level\":\"" + String(log_level) + "\",";
    jsonPayload += "\"event_message\":\"" + String(event_message) + "\"";
    jsonPayload += "}";
    Serial.println("[Supabase] Logging event: " + jsonPayload);
    int res = db.insert("log_event", jsonPayload, false);
    Serial.print("[Supabase] Event Response Code: ");
    Serial.println(res);
}
  

// =============================
// Fungsi: Handle Pesan Telegram
// =============================
void newMsg(FB_msg &msg) {
    if (msg.text == "/Get") {
        getLevel();
        int tdsValue = readTDS();  
        stPUMP = stPump ? "ON" : "OFF";
        stMode = mode ? "Otomatis" : "Manual";

        Serial.println("------> Kirim data sensor ke Telegram");

        String data_sensor = "Smart Volume Tandon :\n";
        data_sensor += "- Volume  = " + String(vol) + " Lt\n";
        data_sensor += "- Mode    = " + stMode + "\n";
        data_sensor += "- Pompa   = " + stPUMP + "\n";
        data_sensor += "- TDS     = " + String(tdsValue) + " ppm\n";
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
    // Serial.begin(115200);
    Serial.begin(9600);
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
    T_sensor = 24;        // tinggi dari dasar ke sensor
    // La_silinder = 8;      // luas alas tabung (cm²)
    La_silinder = 61;    // luas alas tabung (jika digunakan)
    PxL_balok = 5000;     // luas alas balok (jika digunakan)

    // Serial.begin(115200);
    Serial.begin(9600);
    pinMode(trigP, OUTPUT);
    pinMode(echoP, INPUT);
    pinMode(pump, OUTPUT);
    pinMode(tdsPin, INPUT); 
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

    db.begin(supabaseUrl, supabaseKey);

    connectWiFi();

    bot.setChatID(CHAT_ID);
    bot.attach(newMsg);

    String welcome = "Water Level Monitoring Volume\n";
    welcome += "--------------------------------------\n";
    welcome += "Request data /Get\n";
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
        // vol = PxL_balok * T_air;   // Ganti ke La_silinder jika pakai tabung
        vol = La_silinder * T_air;  // Volume dalam cm³
        vol = vol / 1000;
    } else {
        vol = 0;
    }

    lcd.setCursor(9, 0);
    lcd.print(vol, 3);
    lcd.print(" Lt");


    int tdsValue = readTDS();
    logToSupabase(vol, tdsValue);

    if (mode) {  // Mode otomatis
        lcd.setCursor(0, 0);
        lcd.print("OTO");

        if (vol <= 0.3 && fFull) {
            fFull = false;
            isiUlang++;
            bot.sendMessage("Pengisian ulang ke-" + String(isiUlang));
        } else if (vol <= 0.9 && !fFull) {
            pumpOn();
            stPump = false;

            if (!f_oto && isiUlang == 0) {
                bot.sendMessage("Pengisian otomatis dimulai, pompa ON");
                logEventToSupabase(
                    "ON",
                    "Otomatis",
                    isiUlang,
                    "INFO",
                    "Pengisian otomatis dimulai, pompa ON"
                  );
                f_oto = true;
            }
        } else {
            pumpOff();
            stPump = true;

            if (f_oto) {
                String pesan = "Pengisian otomatis selesai, pompa OFF\n";
                pesan += "Pompa akan hidup kembali jika volume < 0.3 lt";
                bot.sendMessage(pesan);
                logEventToSupabase(
                    "OFF",
                    "Otomatis",
                    isiUlang,
                    "INFO",
                    "Pengisian otomatis selesai, pompa OFF"
                  );
                f_oto = false;
            }
            fFull = true;
        }
    } else {  // Mode manual
        lcd.setCursor(0, 3);
        lcd.print("MAN Vol :");
        lcd.setCursor(0, 3);
        lcd.print("    Pump:");

        if (stPump) {
            pumpOn();
            if (!f_man) {
                String pesan = "Pengisian dimulai, pompa ON\n";
                pesan += "Matikan pompa: /Pump_OFF";
                bot.sendMessage(pesan);
                logEventToSupabase(
                    "ON",
                    "Manual",
                    isiUlang,
                    "INFO",
                    "Pompa manual dinyalakan"
                  );
                f_man = true;
            }
        } else {
            pumpOff();
            if (f_man) {
                String pesan = "Pengisian berhenti, pompa OFF\n";
                pesan += "Hidupkan pompa: /Pump_ON";
                bot.sendMessage(pesan);
                f_man = false;
                logEventToSupabase(
                    "OFF",
                    "Manual",
                    isiUlang,
                    "INFO",
                    "Pompa manual dimatikan"
                  );
            }
        }
    }

    delay(30000);
}