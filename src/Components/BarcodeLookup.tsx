import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Search } from 'react-feather';
import { useT } from '../i18n/LanguageProvider';
import { isValidBarcode, lookupBarcode } from '../lib/openFoodFacts';
import type { FoodProduct } from '../lib/openFoodFacts';

type Detector = { detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]> };
type DetectorConstructor = new (options: { formats: string[] }) => Detector;

const detectorConstructor = (): DetectorConstructor | null => {
    const candidate = (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
    return candidate ?? null;
};

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];

type Props = { onFound: (product: FoodProduct) => void };

const BarcodeLookup = ({ onFound }: Props) => {
    const { t } = useT();
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canScan = detectorConstructor() !== null && Boolean(navigator.mediaDevices?.getUserMedia);

    const search = async (value: string) => {
        const clean = value.trim();
        if (!isValidBarcode(clean)) { toast.error(t("barcode.invalid")); return; }
        setBusy(true);
        try {
            const product = await lookupBarcode(clean);
            if (product) {
                onFound(product);
                toast.success(t("barcode.found"));
            } else {
                toast.error(t("barcode.notFound"));
            }
        } catch {
            toast.error(t("barcode.network"));
        } finally {
            setBusy(false);
        }
    };

    const searchRef = useRef(search);
    searchRef.current = search;

    useEffect(() => {
        if (!scanning) return;
        const Detector = detectorConstructor();
        if (!Detector) return;
        let stopped = false;
        let stream: MediaStream | null = null;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const stop = () => {
            stopped = true;
            if (timer) clearTimeout(timer);
            stream?.getTracks().forEach(track => track.stop());
        };

        const start = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                if (stopped) { stream.getTracks().forEach(track => track.stop()); return; }
                const video = videoRef.current;
                if (!video) return;
                video.srcObject = stream;
                await video.play();
                const detector = new Detector({ formats: FORMATS });
                const tick = async () => {
                    if (stopped) return;
                    try {
                        const found = await detector.detect(video);
                        if (found.length > 0) {
                            const value = found[0].rawValue;
                            stop();
                            setScanning(false);
                            setCode(value);
                            void searchRef.current(value);
                            return;
                        }
                    } catch {
                        timer = setTimeout(tick, 250);
                        return;
                    }
                    timer = setTimeout(tick, 250);
                };
                void tick();
            } catch {
                toast.error(t("barcode.camera"));
                setScanning(false);
            }
        };

        void start();
        return stop;
    }, [scanning, t]);

    return (
        <div className="formField barcodeField">
            <label htmlFor="barcodeInput">{t("barcode.label")}<small>{t("barcode.hint")}</small></label>
            <div className="barcodeRow">
                <input
                    id="barcodeInput"
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void search(code); } }}
                    placeholder={t("barcode.placeholder")}
                />
                <button type="button" className="barcodeBtn" disabled={busy} onClick={() => void search(code)} aria-label={t("barcode.search")}>
                    <Search size={16} />
                </button>
                {canScan && (
                    <button type="button" className="barcodeBtn" disabled={busy} onClick={() => setScanning(value => !value)} aria-label={t("barcode.scan")}>
                        <Camera size={16} />
                    </button>
                )}
            </div>
            {scanning && <video ref={videoRef} className="barcodeVideo" muted playsInline />}
            <small className="barcodeCredit">{t("barcode.credit")}</small>
        </div>
    );
};

export default BarcodeLookup;
