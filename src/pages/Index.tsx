import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Wifi, Eye, EyeOff, Download, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type EncType = "WPA" | "WEP" | "nopass";

const Index = () => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<EncType>("WPA");
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const escapeSpecial = (str: string) =>
    str.replace(/([\\;,:"'])/g, "\\$1");

  const wifiString =
    ssid.trim()
      ? `WIFI:T:${encryption};S:${escapeSpecial(ssid)};P:${escapeSpecial(password)};H:${hidden ? "true" : "false"};;`
      : "";

  const handleDownload = () => {
    const svg = document.getElementById("wifi-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      const a = document.createElement("a");
      a.download = `wifi-${ssid || "network"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    toast.success("QR code downloaded!");
  };

  const handleCopy = async () => {
    if (!wifiString) return;
    await navigator.clipboard.writeText(wifiString);
    setCopied(true);
    toast.success("WiFi string copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
            <Wifi className="w-7 h-7 text-primary" />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            WiFi QR Generator
          </h1>
          <p className="text-muted-foreground text-sm">
            Generate a scannable QR code to share your WiFi instantly
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="ssid" className="text-sm font-medium">Network Name (SSID)</Label>
            <Input
              id="ssid"
              placeholder="MyWiFiNetwork"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              maxLength={64}
              className="h-11"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={128}
                className="h-11 pr-10"
                style={{ fontFamily: "var(--font-mono)" }}
                disabled={encryption === "nopass"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Encryption</Label>
              <Select value={encryption} onValueChange={(v) => setEncryption(v as EncType)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2/WPA3</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hidden Network</Label>
              <Select value={hidden ? "yes" : "no"} onValueChange={(v) => setHidden(v === "yes")}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* QR Output */}
        {wifiString && (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="flex justify-center">
              <div className="bg-white p-5 rounded-xl">
                <QRCodeSVG
                  id="wifi-qr"
                  value={wifiString}
                  size={220}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Scan with your phone's camera to connect to <span className="font-medium text-foreground" style={{ fontFamily: "var(--font-mono)" }}>{ssid}</span>
            </p>
            <div className="flex gap-3">
              <Button onClick={handleDownload} className="flex-1 h-11 gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
              <Button onClick={handleCopy} variant="secondary" className="h-11 gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
