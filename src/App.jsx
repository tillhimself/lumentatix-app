import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Package,
  Printer,
  Download,
  Plus,
  Search,
  Sparkles,
  Cpu,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Sun,
  Moon,
  ClipboardCheck,
  Calculator,
  Layers,
  Filter,
  EyeOff,
  Eye,
  RotateCcw,
  Image as ImageIcon,
  Key,
  MessageSquarePlus,
  Send,
  Sliders,
  ShieldCheck,
  Lock,
  LogOut,
  Globe,
  Copy,
  Check
} from 'lucide-react';

// ============================================================================
// VERSION 1.7 RELEASE METADATA (LIVE DOMAIN + LOGIN GATE + VERCEL PROXY)
// ============================================================================
const APP_VERSION = '1.7';
const APP_RELEASE_DATE = '2026-11-26';
const APP_NAME = 'LUMENTATIX';
const APP_MAIN_TITLE = 'PICASSO WORK ORDER & PICKING/ALLOCATION TICKET';
const LIVE_DOMAIN = 'lumentatix.app';

// Exact 8pt Ticket Footer Footnote
const DEFAULT_TICKET_FOOTNOTE =
  'This work order is for the sole use of the intended recipients and may contain confidential and privileged information. Any unauthorized review, use, disclosure or distribution is prohibited. If you are not the intended recipient, please contact management, or destroy all copies of the original document.';

// ============================================================================
// DEFAULT IGNORED BOM PART PREFIXES (Case-Insensitive Starts-With Filter)
// ============================================================================
const DEFAULT_IGNORED_PREFIXES = [
  'CCD',
  'CCL',
  'Advance',
  'PSB',
  'Moons',
  'Nut',
  'Cable',
  'Screw',
  'Pem',
  'Axis',
  'EC',
  'Griplock',
  'Stud',
  'Driver'
];

const LOCAL_STORAGE_IGNORE_KEY = 'picasso_kitting_ignored_prefixes_v1';
const LOCAL_STORAGE_API_KEY = 'picasso_kitting_gemini_api_key_v1';
const LOCAL_STORAGE_PROMPTS_KEY = 'picasso_kitting_custom_prompts_v1';
const LOCAL_STORAGE_TICKET_LOGO_KEY = 'picasso_kitting_ticket_logo_v1';
const LOCAL_STORAGE_V1_6_SNAPSHOT_KEY = 'picasso_kitting_v1_6_saved_snapshot';
const LOCAL_STORAGE_AUTH_KEY = 'lumentatix_auth_session_v1';
// Fallback passcode used ONLY in Gemini Canvas preview (on Vercel, server checks process.env.APP_PASSWORD)
const PREVIEW_DEFAULT_PASSCODE = 'picasso2026';

// ============================================================================
// COPYABLE VERCEL SERVERLESS PROXY & AUTH SNIPPETS (FOR GITHUB + VERCEL)
// ============================================================================
const VERCEL_API_AUTH_CODE = `// File: api/auth.js (Place inside your GitHub repo's /api folder)
// Set Environment Variable APP_PASSWORD in Vercel Dashboard
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { password } = req.body || {};
  const expected = process.env.APP_PASSWORD || 'picasso2026';
  if (!password || password !== expected) {
    return res.status(401).json({ ok: false, error: 'Invalid password' });
  }
  const token = Buffer.from(\`lumentatix:\${expected}\`).toString('base64');
  return res.status(200).json({ ok: true, token });
}`;

const VERCEL_API_ANALYZE_CODE = `// File: api/analyze.js (Place inside your GitHub repo's /api folder)
// Set Environment Variables GEMINI_API_KEY and APP_PASSWORD in Vercel Dashboard
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const expected = process.env.APP_PASSWORD || 'picasso2026';
  const expectedToken = Buffer.from(\`lumentatix:\${expected}\`).toString('base64');
  const incomingToken = req.headers['x-lumentatix-token'];
  if (!incomingToken || incomingToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel.' });
  }
  try {
    const geminiRes = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=\${apiKey}\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    );
    const data = await geminiRes.json();
    return res.status(geminiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Proxy request failed' });
  }
}`;

// Exact 1:1 Vector Data URI matching the attached PICASSO W TEXT-01.JPEG (548x163 aspect ratio, white background)
const ATTACHED_PICASSO_LOGO_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 548 163" width="548" height="163">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  <polygon points="26,38 61,21 61,85 26,85" fill="#808285"/>
  <polygon points="0,69 61,54 61,134 0,121" fill="#808285"/>
  <polygon points="26,62 61,54 61,85 26,85" fill="#231F20"/>
  <polygon points="73,23 122,0 122,85 73,85" fill="#F5B800"/>
  <polygon points="73,85 122,85 122,140 73,163" fill="#C7C8CA"/>
  <path d="M16 85 H63 C79 85 89 94 89 108 C89 122 79 131 63 131 H35 V156 H16 V85 Z M35 100 V116 H60 C67 116 71 113 71 108 C71 103 67 100 60 100 H35 Z" fill="#FFFFFF"/>
  <text x="148" y="106" fill="#231F20" font-family="Montserrat, Arial, Helvetica, sans-serif" font-weight="800" font-size="76" letter-spacing="2">PICASSO</text>
  <text x="150" y="140" fill="#231F20" font-family="Montserrat, Arial, Helvetica, sans-serif" font-weight="600" font-size="26.5" letter-spacing="1.5">BY AXIS LIGHTING USA</text>
</svg>`);

// App Header Logo: Transparent background with white "PICASSO" text and button-matching orange/amber (#F59E0B) "BY AXIS LIGHTING USA" text
const APP_HEADER_TRANSPARENT_WHITE_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 548 163" width="548" height="163">
  <polygon points="26,38 61,21 61,85 26,85" fill="#808285"/>
  <polygon points="0,69 61,54 61,134 0,121" fill="#808285"/>
  <polygon points="26,62 61,54 61,85 26,85" fill="#231F20"/>
  <polygon points="73,23 122,0 122,85 73,85" fill="#F5B800"/>
  <polygon points="73,85 122,85 122,140 73,163" fill="#C7C8CA"/>
  <path d="M16 85 H63 C79 85 89 94 89 108 C89 122 79 131 63 131 H35 V156 H16 V85 Z M35 100 V116 H60 C67 116 71 113 71 108 C71 103 67 100 60 100 H35 Z" fill="#FFFFFF"/>
  <text x="148" y="106" fill="#FFFFFF" font-family="Montserrat, Arial, Helvetica, sans-serif" font-weight="800" font-size="76" letter-spacing="2">PICASSO</text>
  <text x="150" y="140" fill="#F59E0B" font-family="Montserrat, Arial, Helvetica, sans-serif" font-weight="600" font-size="26.5" letter-spacing="1.5">BY AXIS LIGHTING USA</text>
</svg>`);

// Helper to format current day at the time of generating the ticket
const getFormattedCurrentDay = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper to format current date & time for "Date / Time Released to Floor"
const getFormattedCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper to check if a BOM part matches any active ignored prefix
const getMatchingIgnorePrefix = (partNumber, description, prefixes) => {
  const cleanPart = (partNumber || '').trim().toLowerCase();
  const cleanDesc = (description || '').trim().toLowerCase();
  for (const rawPrefix of prefixes) {
    const p = (rawPrefix || '').trim().toLowerCase();
    if (!p) continue;
    if (cleanPart.startsWith(p) || cleanDesc.startsWith(p)) {
      return rawPrefix;
    }
  }
  return null;
};

// ============================================================================
// DEFAULT BLANK INITIAL STATES (NO DEMO PROJECT PRE-LOADED)
// ============================================================================
const createBlankJobParams = () => ({
  salesOrderNumber: '',
  submittalDrawingNumber: '',
  bomNumbers: '',
  revision: '',
  projectName: '',
  generatedDay: getFormattedCurrentDay(),
  deadline: '',
  issuedBy: '',
  releasedTo: '',
  dateTimeReleasedToFloor: '',
  ticketFootnote: DEFAULT_TICKET_FOOTNOTE
});

const EMPTY_SUBMITTAL_SUMMARY = {
  finish: '',
  mounting: '',
  ledDirectIndirect: '',
  canopyColor: '',
  suspensionCableLength: '',
  powerCordColorAndLength: '',
  option: ''
};

export default function App() {
  // Authentication / Staff Login Gate State
  const [authToken, setAuthToken] = useState(() => {
    try {
      return (
        localStorage.getItem(LOCAL_STORAGE_AUTH_KEY) ||
        sessionStorage.getItem(LOCAL_STORAGE_AUTH_KEY) ||
        ''
      );
    } catch (e) {
      return '';
    }
  });
  const isAuthenticated = Boolean(authToken);
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Deploy & Domain Setup Modal State
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState('');

  // Theme & Navigation State
  const [lightMode, setLightMode] = useState(false);
  const [activeTab, setActiveTab] = useState('workspace');
  const [viewGrouping, setViewGrouping] = useState('consolidated');

  // Ticket Logo State (Uses attached PICASSO W TEXT-01.JPEG or fallback vector)
  const [ticketLogoSrc, setTicketLogoSrc] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_TICKET_LOGO_KEY) || 'PICASSO W TEXT-01.JPEG';
    } catch (e) {
      return 'PICASSO W TEXT-01.JPEG';
    }
  });

  // Job & Run Parameters State (Starts Blank for Clean Sharing)
  const [jobParams, setJobParams] = useState(createBlankJobParams);

  // Submittal Notes Summary State (Starts Blank)
  const [submittalSummary, setSubmittalSummary] = useState(EMPTY_SUBMITTAL_SUMMARY);

  // Submittal Lines & BOM Parts State (Starts Blank)
  const [submittalLines, setSubmittalLines] = useState([]);
  const [bomParts, setBomParts] = useState([]);

  // Ignored BOM Part Prefixes State (Preserves permanent defaults)
  const [ignoredPrefixes, setIgnoredPrefixes] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_IGNORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          const existingLower = new Set(parsed.map((p) => String(p).toLowerCase()));
          DEFAULT_IGNORED_PREFIXES.forEach((defPrefix) => {
            if (!existingLower.has(defPrefix.toLowerCase())) {
              merged.push(defPrefix);
            }
          });
          return merged;
        }
      }
    } catch (e) {
      // Fallback to default prefixes if localStorage is unavailable
    }
    return DEFAULT_IGNORED_PREFIXES;
  });
  const [newPrefixInput, setNewPrefixInput] = useState('');
  const [showExcludedPreview, setShowExcludedPreview] = useState(false);

  // Custom AI Prompts / Live Fix Instructions State
  const [savedPrompts, setSavedPrompts] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROMPTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // Ignore storage errors
    }
    return [];
  });
  const [newPromptInput, setNewPromptInput] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_IGNORE_KEY, JSON.stringify(ignoredPrefixes));
    } catch (e) {
      // Ignore storage write errors
    }
  }, [ignoredPrefixes]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROMPTS_KEY, JSON.stringify(savedPrompts));
    } catch (e) {
      // Ignore storage write errors
    }
  }, [savedPrompts]);

  // Automatically persist Version 1.6 snapshot in browser storage
  useEffect(() => {
    try {
      const v16Snapshot = {
        appVersion: APP_VERSION,
        appName: APP_NAME,
        appTitle: APP_MAIN_TITLE,
        releaseDate: APP_RELEASE_DATE,
        defaultScopeRule: 'ALL',
        jobParams,
        submittalSummary,
        submittalLines,
        bomParts,
        ignoredPrefixes,
        savedPrompts
      };
      localStorage.setItem(LOCAL_STORAGE_V1_6_SNAPSHOT_KEY, JSON.stringify(v16Snapshot));
    } catch (e) {
      // Ignore storage write errors
    }
  }, [jobParams, submittalSummary, submittalLines, bomParts, ignoredPrefixes, savedPrompts]);

  // Raw Text & File Uploads for AI Analysis (Starts Blank)
  const [bomText, setBomText] = useState('');
  const [submittalText, setSubmittalText] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [bomFiles, setBomFiles] = useState([]);
  const [submittalFiles, setSubmittalFiles] = useState([]);

  // AI Loading & Banner State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisBanner, setAnalysisBanner] = useState(
    'Version 1.7 Ready — Staff Login Gate & Vercel Server Proxy enabled for lumentatix.app. Click "Deploy / Domain" for your GitHub, Vercel & Namecheap setup.'
  );
  const [errorMessage, setErrorMessage] = useState(null);

  // ==========================================================================
  // STAFF LOGIN GATE HANDLERS (SERVER /api/auth + PREVIEW FALLBACK)
  // ==========================================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const entered = loginPassword.trim();
    if (!entered) {
      setLoginError('Please enter your staff passcode.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    const saveSessionToken = (tokenValue) => {
      setAuthToken(tokenValue);
      setLoginPassword('');
      try {
        if (rememberDevice) {
          localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, tokenValue);
          sessionStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        } else {
          sessionStorage.setItem(LOCAL_STORAGE_AUTH_KEY, tokenValue);
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        }
      } catch (err) {
        // Ignore storage restrictions
      }
    };

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: entered })
      });

      if (response.ok) {
        const data = await response.json();
        saveSessionToken(data.token || 'authenticated');
        return;
      }

      if (response.status === 401) {
        setLoginError('Incorrect passcode. Please try again.');
        return;
      }

      // 404 or non-Vercel environment (e.g. Gemini Canvas preview): fallback check
      if (entered === PREVIEW_DEFAULT_PASSCODE) {
        saveSessionToken('preview-authenticated');
      } else {
        setLoginError(`Incorrect passcode. (Preview default: ${PREVIEW_DEFAULT_PASSCODE})`);
      }
    } catch (err) {
      // Network error / no backend in preview mode: fallback check
      if (entered === PREVIEW_DEFAULT_PASSCODE) {
        saveSessionToken('preview-authenticated');
      } else {
        setLoginError(`Incorrect passcode. (Preview default: ${PREVIEW_DEFAULT_PASSCODE})`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    setAuthToken('');
    setLoginPassword('');
    setLoginError('');
    try {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      sessionStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    } catch (e) {
      // Ignore storage errors
    }
  };

  const handleCopySnippet = (key, text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedSnippet(key);
        setTimeout(() => setCopiedSnippet(''), 2000);
      });
    }
  };

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Local Gemini API Key State
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_API_KEY) || '';
    } catch (e) {
      return '';
    }
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Modal State for Adding New Part Row (Scope always defaults to 'ALL')
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartForm, setNewPartForm] = useState({
    partNumber: '',
    description: '',
    lengthFilter: 'ALL',
    indUnitQty: 1,
    borUnitQty: 1,
    morUnitQty: 1,
    eorUnitQty: 1
  });

  // File Input Refs
  const imageFileInputRef = useRef(null);
  const bomFileInputRef = useRef(null);
  const submittalFileInputRef = useRef(null);
  const backupRestoreInputRef = useRef(null);
  const printSheetRef = useRef(null);
  const sectionTicketRef = useRef(null);

  // ==========================================================================
  // VERSION 1.6 BACKUP & RESTORE HANDLERS
  // ==========================================================================
  const handleDownloadV1Backup = () => {
    const normalizedBomParts = bomParts.map((part) => ({
      ...part,
      lengthFilter: part.lengthFilter || 'ALL'
    }));
    const backupPayload = {
      appVersion: APP_VERSION,
      appName: APP_NAME,
      appTitle: APP_MAIN_TITLE,
      releaseDate: APP_RELEASE_DATE,
      defaultScopeRule: 'ALL',
      timestamp: new Date().toISOString(),
      jobParams,
      submittalSummary,
      submittalLines,
      bomParts: normalizedBomParts,
      ignoredPrefixes,
      savedPrompts,
      bomText,
      submittalText
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_V1_6_SNAPSHOT_KEY, JSON.stringify(backupPayload));
    } catch (e) {
      // Ignore storage errors
    }
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LUMENTATIX_v${APP_VERSION}_Backup_SO_${
      jobParams.salesOrderNumber || 'Blank'
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setAnalysisBanner(
      'Version 1.6 Backup saved to browser storage and downloaded as a .JSON file.'
    );
  };

  const handleRestoreV1Backup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.jobParams) {
          setJobParams({
            ...createBlankJobParams(),
            ...parsed.jobParams,
            ticketFootnote:
              parsed.jobParams.ticketFootnote || DEFAULT_TICKET_FOOTNOTE
          });
        }
        if (parsed.submittalSummary) setSubmittalSummary(parsed.submittalSummary);
        if (Array.isArray(parsed.submittalLines)) setSubmittalLines(parsed.submittalLines);
        if (Array.isArray(parsed.bomParts)) {
          setBomParts(
            parsed.bomParts.map((p) => ({
              ...p,
              lengthFilter: 'ALL'
            }))
          );
        }
        if (Array.isArray(parsed.ignoredPrefixes)) setIgnoredPrefixes(parsed.ignoredPrefixes);
        if (Array.isArray(parsed.savedPrompts)) setSavedPrompts(parsed.savedPrompts);
        if (typeof parsed.bomText === 'string') setBomText(parsed.bomText);
        if (typeof parsed.submittalText === 'string') setSubmittalText(parsed.submittalText);
        setAnalysisBanner(
          `Restored Version ${parsed.appVersion || APP_VERSION} Backup (${
            parsed.jobParams?.projectName || 'Job'
          }) with Scope set to "All Sections".`
        );
      } catch (err) {
        setErrorMessage('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Auto-Parse Submittal Notes Text locally
  const handleParseNotesSummaryLocally = () => {
    const raw = (submittalText || '').trim();
    if (!raw && submittalFiles.length === 0 && imageFiles.length === 0) {
      setAnalysisBanner(
        'Paste Submittal Notes or upload an SD Drawing first, then click Extract from Notes or Run AI.'
      );
      return;
    }

    const findMatch = (regexList, fallback = 'Not specified in notes') => {
      for (const rx of regexList) {
        const m = raw.match(rx);
        if (m && m[1]) return m[1].trim();
      }
      return fallback;
    };

    const finishVal = findMatch(
      [
        /Finish\s*:\s*([^\n\r]+)/i,
        /(BK\s*=\s*MATTE BLACK[^\n\r]*)/i,
        /(WH\s*=\s*WHITE[^\n\r]*)/i,
        /(SL\s*=\s*SILVER[^\n\r]*)/i
      ],
      submittalSummary.finish || 'See Submittal Drawing Notes'
    );

    const mountingVal = findMatch(
      [
        /Mounting\s*:\s*([^\n\r]+)/i,
        /(Surface mounted[^\n\r]*)/i,
        /(Suspended[^\n\r]*)/i,
        /(Recessed[^\n\r]*)/i
      ],
      submittalSummary.mounting || 'See Submittal Drawing Notes'
    );

    const ledVal = findMatch(
      [
        /LEDs?\s*:\s*([^\n\r]+)/i,
        /((?:Direct|Indirect|Direct\/Indirect)[^\n\r]*Lm\/Ft[^\n\r]*)/i
      ],
      submittalSummary.ledDirectIndirect || 'See Submittal Drawing Notes'
    );

    const canopyVal = findMatch(
      [/Canopy(?:\s*Color)?\s*:\s*([^\n\r]+)/i],
      /surface\s*mount/i.test(raw) ? 'N/A (Surface Mount)' : 'Not specified in notes'
    );

    const cableVal = findMatch(
      [
        /(?:Suspension\s*Cable|Aircraft\s*Cable|Cable\s*Length)\s*:\s*([^\n\r]+)/i,
        /(\d+\s*(?:ft|['"]|in)\s*(?:aircraft|suspension)\s*cable[^\n\r]*)/i
      ],
      /surface\s*mount/i.test(raw) ? 'N/A (Surface Mount)' : 'Not specified in notes'
    );

    const cordVal = findMatch(
      [
        /(?:Power\s*Cord|Cord|Feed)\s*:\s*([^\n\r]+)/i,
        /(\d+\s*(?:ft|['"])\s*(?:white|black|clear|silver)?\s*power\s*cord[^\n\r]*)/i
      ],
      submittalSummary.powerCordColorAndLength || 'Not specified in notes'
    );

    const optionVal = findMatch(
      [/Options?\s*:\s*([^\n\r]+)/i, /(EMC\s*=\s*EMERGENCY[^\n\r]*)/i],
      submittalSummary.option || 'Standard / None specified'
    );

    setSubmittalSummary({
      finish: finishVal,
      mounting: mountingVal,
      ledDirectIndirect: ledVal,
      canopyColor: canopyVal,
      suspensionCableLength: cableVal,
      powerCordColorAndLength: cordVal,
      option: optionVal
    });
    setAnalysisBanner('Submittal Notes Summary updated from Submittal Notes.');
  };

  // ==========================================================================
  // STEP 1 & STEP 2: CALCULATE IND, BOR, MOR, EOR, COR###° + SECTION LENGTH BREAKDOWN
  // Supports:
  // - IND: Solid 1-piece individual fixture
  // - RUN: Linear or corner run (BOR/BOM + MOR + EOR + optional COR###°)
  // - PATTERN: Closed pattern (no ends — all straight sections treated as MOR + corners as COR###°)
  // Works standalone even with NO BOM provided.
  // ==========================================================================
  const sectionRollup = useMemo(() => {
    let totalFixturesAndRunsOrdered = 0;
    let totalIND = 0;
    let totalBOR = 0;
    let totalMOR = 0;
    let totalEOR = 0;
    let totalCOR = 0;

    // Track length-specific section counts (4' vs 8')
    const byLength = {
      "4'": { IND: 0, BOR: 0, MOR: 0, EOR: 0, COR: 0 },
      "8'": { IND: 0, BOR: 0, MOR: 0, EOR: 0, COR: 0 }
    };

    // Track exact dimension breakdown in format: [095.750" (BOR) - 15 PCS] or [024.000"x024.000" (COR090°) - 4 PCS]
    const exactLengthMap = new Map();
    const addExactLengthCount = (exactDimStr, roleType, count) => {
      if (!count || count <= 0) return;
      const cleanDim = (exactDimStr || '').trim() || '096.000"';
      const normalizedDim = cleanDim.endsWith('"') ? cleanDim : `${cleanDim}"`;
      const key = `${normalizedDim}__${roleType}`;
      const existing = exactLengthMap.get(key) || {
        dim: normalizedDim,
        role: roleType,
        pcs: 0
      };
      existing.pcs += count;
      exactLengthMap.set(key, existing);
    };

    const getDefaultExactDim = (nominalLen, roleType) => {
      if (nominalLen === "4'") {
        if (roleType === 'IND') return '048.500"';
        if (roleType === 'BOR') return '047.750"';
        if (roleType === 'MOR') return '048.000"';
        return '048.250"';
      } else {
        if (roleType === 'IND') return '096.250"';
        if (roleType === 'BOR') return '095.750"';
        if (roleType === 'MOR') return '096.000"';
        return '095.825"';
      }
    };

    const formatCorRole = (rawAngle) => {
      const cleaned = String(rawAngle ?? '090')
        .replace(/[^0-9.]/g, '')
        .trim();
      const padded = cleaned ? cleaned.padStart(3, '0') : '090';
      return `COR${padded}°`;
    };

    const lineBreakdowns = submittalLines.map((line) => {
      const qty = Math.max(0, Number(line.qtyRequested) || 0);
      totalFixturesAndRunsOrdered += qty;

      const corPerUnit = Math.max(0, Number(line.corCountPerRun) || 0);
      const corAngleLabel = formatCorRole(line.corAngle || '090');
      const corExact =
        (line.corExactDim || '').trim() || '024.000"x024.000"';
      const normalizedCorExact = corExact.endsWith('"') ? corExact : `${corExact}"`;

      // CASE 1: ONE SOLID PIECE -> IND (Individual Fixture)
      if (line.configMode === 'IND') {
        const indCount = qty;
        totalIND += indCount;
        const lenKey = line.indLength === "8'" ? "8'" : "4'";
        byLength[lenKey].IND += indCount;

        const indExact = line.indExactDim || getDefaultExactDim(lenKey, 'IND');
        const normIndExact = indExact.endsWith('"') ? indExact : `${indExact}"`;
        addExactLengthCount(normIndExact, 'IND', indCount);

        const detailedSections = [
          {
            role: 'IND',
            length: normIndExact,
            unitQty: 1,
            totalQty: indCount,
            tag: `[${normIndExact} (IND) - ${indCount} PCS]`
          }
        ];

        return {
          ...line,
          indExactDim: normIndExact,
          corRoleLabel: corAngleLabel,
          calcIND: indCount,
          calcBOR: 0,
          calcMOR: 0,
          calcEOR: 0,
          calcCOR: 0,
          detailedSections,
          formattedLengthTags: detailedSections.map((s) => s.tag)
        };
      }

      // CASE 2: CLOSED PATTERN (Square, Rectangular, Continuous Loop — NO ENDS)
      // All straight sections MUST be treated as MORs (even when made of multiple different MOR lengths),
      // and corners marked as COR###° (0 BOR and 0 EOR).
      if (line.configMode === 'PATTERN') {
        const detailedSections = [];
        let patternTotalMOR = 0;
        let patternTotalCOR = 0;

        // If customSections array is populated (e.g. multiple different MOR lengths + corners in a closed rectangle),
        // sum each distinct MOR length and COR###° corner and multiply by qtyRequested
        if (Array.isArray(line.customSections) && line.customSections.length > 0) {
          line.customSections.forEach((seg) => {
            const segCountPerUnit = Math.max(0, Number(seg.countPerRun) || 0);
            const segTotal = segCountPerUnit * qty;
            if (segTotal <= 0) return;

            const isCorner = seg.role === 'COR' || String(seg.role || '').startsWith('COR');
            const segRole = isCorner
              ? formatCorRole(seg.angle || line.corAngle || '090')
              : 'MOR';
            const rawDim = (
              seg.exactDim || (isCorner ? normalizedCorExact : '096.000"')
            ).trim();
            const normSegDim = rawDim.endsWith('"') ? rawDim : `${rawDim}"`;

            if (isCorner) {
              patternTotalCOR += segTotal;
              byLength["4'"].COR += segTotal;
            } else {
              patternTotalMOR += segTotal;
              const numInches = parseFloat(normSegDim.replace(/[^0-9.]/g, '')) || 96;
              const bucketKey = numInches <= 60 ? "4'" : "8'";
              byLength[bucketKey].MOR += segTotal;
            }

            addExactLengthCount(normSegDim, segRole, segTotal);
            detailedSections.push({
              role: segRole,
              length: normSegDim,
              unitQty: segCountPerUnit,
              totalQty: segTotal,
              tag: `[${normSegDim} (${segRole}) - ${segTotal} PCS]`
            });
          });

          totalMOR += patternTotalMOR;
          totalCOR += patternTotalCOR;

          return {
            ...line,
            corExactDim: normalizedCorExact,
            corRoleLabel: corAngleLabel,
            calcIND: 0,
            calcBOR: 0,
            calcMOR: patternTotalMOR,
            calcEOR: 0,
            calcCOR: patternTotalCOR,
            detailedSections,
            formattedLengthTags: detailedSections.map((s) => s.tag)
          };
        }

        // Fallback when customSections is empty: use single MOR length + COR count
        const morPerRun = Math.max(1, Number(line.morCountPerRun) || 4);
        const morCount = morPerRun * qty;
        const corPerPattern =
          line.corCountPerRun !== undefined && line.corCountPerRun !== ''
            ? Math.max(0, Number(line.corCountPerRun))
            : 4;
        const corCount = corPerPattern * qty;

        totalMOR += morCount;
        totalCOR += corCount;

        const morLenKey = line.morLength === "4'" ? "4'" : "8'";
        byLength[morLenKey].MOR += morCount;
        byLength["4'"].COR += corCount;

        const morExact = line.morExactDim || getDefaultExactDim(morLenKey, 'MOR');
        const normMorExact = morExact.endsWith('"') ? morExact : `${morExact}"`;

        if (morCount > 0) {
          addExactLengthCount(normMorExact, 'MOR', morCount);
          detailedSections.push({
            role: 'MOR',
            length: normMorExact,
            unitQty: morPerRun,
            totalQty: morCount,
            tag: `[${normMorExact} (MOR) - ${morCount} PCS]`
          });
        }
        if (corCount > 0) {
          addExactLengthCount(normalizedCorExact, corAngleLabel, corCount);
          detailedSections.push({
            role: corAngleLabel,
            length: normalizedCorExact,
            unitQty: corPerPattern,
            totalQty: corCount,
            tag: `[${normalizedCorExact} (${corAngleLabel}) - ${corCount} PCS]`
          });
        }

        return {
          ...line,
          morExactDim: normMorExact,
          corExactDim: normalizedCorExact,
          corRoleLabel: corAngleLabel,
          calcIND: 0,
          calcBOR: 0,
          calcMOR: morCount,
          calcEOR: 0,
          calcCOR: corCount,
          detailedSections,
          formattedLengthTags: detailedSections.map((s) => s.tag)
        };
      }

      // CASE 3: LINEAR / OPEN RUN (BOR/BOM + MOR + EOR + optional COR###°)
      const borCount = qty;
      const eorCount = qty;
      const morPerRun = Math.max(0, Number(line.morCountPerRun) || 0);
      const morCount = morPerRun * qty;
      const corCount = corPerUnit * qty;

      totalBOR += borCount;
      totalMOR += morCount;
      totalEOR += eorCount;
      totalCOR += corCount;

      const borLenKey = line.borLength === "4'" ? "4'" : "8'";
      const morLenKey = line.morLength === "4'" ? "4'" : "8'";
      const eorLenKey = line.eorLength === "8'" ? "8'" : "4'";

      byLength[borLenKey].BOR += borCount;
      byLength[morLenKey].MOR += morCount;
      byLength[eorLenKey].EOR += eorCount;
      byLength["4'"].COR += corCount;

      const borExact = line.borExactDim || getDefaultExactDim(borLenKey, 'BOR');
      const morExact = line.morExactDim || getDefaultExactDim(morLenKey, 'MOR');
      const eorExact = line.eorExactDim || getDefaultExactDim(eorLenKey, 'EOR');

      const normBorExact = borExact.endsWith('"') ? borExact : `${borExact}"`;
      const normMorExact = morExact.endsWith('"') ? morExact : `${morExact}"`;
      const normEorExact = eorExact.endsWith('"') ? eorExact : `${eorExact}"`;

      addExactLengthCount(normBorExact, 'BOR', borCount);
      if (morCount > 0) {
        addExactLengthCount(normMorExact, 'MOR', morCount);
      }
      addExactLengthCount(normEorExact, 'EOR', eorCount);
      if (corCount > 0) {
        addExactLengthCount(normalizedCorExact, corAngleLabel, corCount);
      }

      const detailedSections = [
        {
          role: 'BOR',
          length: normBorExact,
          unitQty: 1,
          totalQty: borCount,
          tag: `[${normBorExact} (BOR) - ${borCount} PCS]`
        }
      ];

      if (morCount > 0) {
        detailedSections.push({
          role: 'MOR',
          length: normMorExact,
          unitQty: morPerRun,
          totalQty: morCount,
          tag: `[${normMorExact} (MOR) - ${morCount} PCS]`
        });
      }

      detailedSections.push({
        role: 'EOR',
        length: normEorExact,
        unitQty: 1,
        totalQty: eorCount,
        tag: `[${normEorExact} (EOR) - ${eorCount} PCS]`
      });

      if (corCount > 0) {
        detailedSections.push({
          role: corAngleLabel,
          length: normalizedCorExact,
          unitQty: corPerUnit,
          totalQty: corCount,
          tag: `[${normalizedCorExact} (${corAngleLabel}) - ${corCount} PCS]`
        });
      }

      return {
        ...line,
        borExactDim: normBorExact,
        morExactDim: normMorExact,
        eorExactDim: normEorExact,
        corExactDim: normalizedCorExact,
        corRoleLabel: corAngleLabel,
        calcIND: 0,
        calcBOR: borCount,
        calcMOR: morCount,
        calcEOR: eorCount,
        calcCOR: corCount,
        detailedSections,
        formattedLengthTags: detailedSections.map((s) => s.tag)
      };
    });

    const totalSections = totalIND + totalBOR + totalMOR + totalEOR + totalCOR;
    const exactLengthSummary = Array.from(exactLengthMap.values()).map((entry) => ({
      ...entry,
      formatted: `[${entry.dim} (${entry.role}) - ${entry.pcs} PCS]`
    }));

    return {
      totalFixturesAndRunsOrdered,
      totalIND,
      totalBOR,
      totalMOR,
      totalEOR,
      totalCOR,
      totalSections,
      byLength,
      lineBreakdowns,
      exactLengthSummary
    };
  }, [submittalLines]);

  // ==========================================================================
  // STEP 3: CROSS-REFERENCE BOM & MULTIPLY QUANTITIES BY IND, BOR, MOR, EOR
  // ==========================================================================
  const calculatedPickList = useMemo(() => {
    const { totalIND, totalBOR, totalMOR, totalEOR, byLength } = sectionRollup;

    return bomParts.map((part) => {
      let indTotal = 0;
      let borTotal = 0;
      let morTotal = 0;
      let eorTotal = 0;
      let mathTrace = '';
      let sectionScopeBadge = 'ALL SECTIONS';

      const scope = part.lengthFilter || 'ALL';

      if (scope === "4'") {
        const ind4 = byLength["4'"].IND;
        const bor4 = byLength["4'"].BOR;
        const mor4 = byLength["4'"].MOR;
        const eor4 = byLength["4'"].EOR;

        indTotal = ind4 * (Number(part.indUnitQty) || 0);
        borTotal = bor4 * (Number(part.borUnitQty) || 0);
        morTotal = mor4 * (Number(part.morUnitQty) || 0);
        eorTotal = eor4 * (Number(part.eorUnitQty) || 0);
        sectionScopeBadge = "4'-0\" SECTIONS ONLY";
        mathTrace = `4' Sections: (${ind4} IND × ${part.indUnitQty}) + (${bor4} BOR × ${part.borUnitQty}) + (${mor4} MOR × ${part.morUnitQty}) + (${eor4} EOR × ${part.eorUnitQty})`;
      } else if (scope === "8'") {
        const ind8 = byLength["8'"].IND;
        const bor8 = byLength["8'"].BOR;
        const mor8 = byLength["8'"].MOR;
        const eor8 = byLength["8'"].EOR;

        indTotal = ind8 * (Number(part.indUnitQty) || 0);
        borTotal = bor8 * (Number(part.borUnitQty) || 0);
        morTotal = mor8 * (Number(part.morUnitQty) || 0);
        eorTotal = eor8 * (Number(part.eorUnitQty) || 0);
        sectionScopeBadge = "8'-0\" SECTIONS ONLY";
        mathTrace = `8' Sections: (${ind8} IND × ${part.indUnitQty}) + (${bor8} BOR × ${part.borUnitQty}) + (${mor8} MOR × ${part.morUnitQty}) + (${eor8} EOR × ${part.eorUnitQty})`;
      } else if (scope === 'AUTO_FT') {
        indTotal = byLength["4'"].IND * 4 + byLength["8'"].IND * 8;
        borTotal = byLength["4'"].BOR * 4 + byLength["8'"].BOR * 8;
        morTotal = byLength["4'"].MOR * 4 + byLength["8'"].MOR * 8;
        eorTotal = byLength["4'"].EOR * 4 + byLength["8'"].EOR * 8;
        sectionScopeBadge = "4' (Qty 4) & 8' (Qty 8)";
        mathTrace = `IND: ${indTotal} | BOR: ${borTotal} (${byLength["8'"].BOR}×8 + ${byLength["4'"].BOR}×4) | MOR: ${morTotal} | EOR: ${eorTotal} (${byLength["4'"].EOR}×4 + ${byLength["8'"].EOR}×8)`;
      } else if (scope === 'BRACKET_RULE') {
        indTotal = byLength["4'"].IND * 2 + byLength["8'"].IND * 3;
        borTotal = byLength["4'"].BOR * 2 + byLength["8'"].BOR * 3;
        morTotal = byLength["4'"].MOR * 2 + byLength["8'"].MOR * 3;
        eorTotal = byLength["4'"].EOR * 2 + byLength["8'"].EOR * 3;
        sectionScopeBadge = "4' (Qty 2) & 8' (Qty 3)";
        mathTrace = `IND: ${indTotal} | BOR: ${borTotal} (${byLength["8'"].BOR}×3 + ${byLength["4'"].BOR}×2) | MOR: ${morTotal} | EOR: ${eorTotal} (${byLength["4'"].EOR}×2 + ${byLength["8'"].EOR}×3)`;
      } else {
        indTotal = totalIND * (Number(part.indUnitQty) || 0);
        borTotal = totalBOR * (Number(part.borUnitQty) || 0);
        morTotal = totalMOR * (Number(part.morUnitQty) || 0);
        eorTotal = totalEOR * (Number(part.eorUnitQty) || 0);
        sectionScopeBadge = 'ALL SECTIONS (IND/BOR/MOR/EOR)';
        mathTrace = `(${totalIND} IND × ${part.indUnitQty}) + (${totalBOR} BOR × ${part.borUnitQty}) + (${totalMOR} MOR × ${part.morUnitQty}) + (${totalEOR} EOR × ${part.eorUnitQty})`;
      }

      const totalJobQty = indTotal + borTotal + morTotal + eorTotal;
      const matchedIgnoreRule = getMatchingIgnorePrefix(
        part.partNumber,
        part.description,
        ignoredPrefixes
      );

      return {
        ...part,
        lengthFilter: scope,
        indTotal,
        borTotal,
        morTotal,
        eorTotal,
        totalJobQty,
        mathTrace,
        sectionScopeBadge,
        matchedIgnoreRule
      };
    });
  }, [bomParts, sectionRollup, ignoredPrefixes]);

  // Active (Non-Ignored) Pick List vs. Ignored/Excluded BOM Parts
  const activePickList = useMemo(() => {
    return calculatedPickList.filter((item) => !item.matchedIgnoreRule);
  }, [calculatedPickList]);

  const excludedBomParts = useMemo(() => {
    return calculatedPickList.filter((item) => Boolean(item.matchedIgnoreRule));
  }, [calculatedPickList]);

  // Filtered Pick List by Search Query
  const filteredPickList = useMemo(() => {
    if (!searchQuery.trim()) return activePickList;
    const q = searchQuery.toLowerCase();
    return activePickList.filter(
      (item) =>
        item.partNumber.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [activePickList, searchQuery]);

  // Total Pieces Across Entire Job (Excludes Ignored Parts)
  const grandTotalPieces = useMemo(() => {
    return activePickList.reduce((acc, item) => acc + item.totalJobQty, 0);
  }, [activePickList]);

  // ==========================================================================
  // HANDLERS: IGNORED PREFIXES, SUBMITTAL LINES, BOM EDITS, FILE UPLOADS
  // ==========================================================================

  const handleAddIgnoredPrefix = (e) => {
    e.preventDefault();
    if (!newPrefixInput.trim()) return;

    const entries = newPrefixInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (entries.length === 0) return;

    setIgnoredPrefixes((prev) => {
      const existingLower = new Set(prev.map((p) => p.toLowerCase()));
      const additions = [];
      entries.forEach((entry) => {
        if (!existingLower.has(entry.toLowerCase())) {
          existingLower.add(entry.toLowerCase());
          additions.push(entry);
        }
      });
      return [...prev, ...additions];
    });

    setNewPrefixInput('');
  };

  const handleRemoveIgnoredPrefix = (prefixToRemove) => {
    setIgnoredPrefixes((prev) => prev.filter((p) => p !== prefixToRemove));
  };

  const handleResetDefaultPrefixes = () => {
    setIgnoredPrefixes(DEFAULT_IGNORED_PREFIXES);
  };

  // Handlers for Custom AI Prompts / Fix Instructions
  const handleAddPromptRule = (e) => {
    e.preventDefault();
    if (!newPromptInput.trim()) return;
    const ruleText = newPromptInput.trim();
    setSavedPrompts((prev) => [...prev, ruleText]);
    setNewPromptInput('');
    setAnalysisBanner(`Added AI Prompt Rule: "${ruleText}"`);
  };

  const handleRemovePromptRule = (indexToRemove) => {
    setSavedPrompts((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleApplyPromptFixNow = async () => {
    let updatedPrompts = [...savedPrompts];
    if (newPromptInput.trim()) {
      const ruleText = newPromptInput.trim();
      updatedPrompts.push(ruleText);
      setSavedPrompts(updatedPrompts);
      setNewPromptInput('');
    }
    await runGeminiCrossReference(updatedPrompts);
  };

  const handleUpdateSubmittalLine = (id, field, value) => {
    setSubmittalLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );
  };

  const handleAddSubmittalLine = () => {
    const newLine = {
      id: `sub-line-${Date.now()}`,
      catalogLine: '',
      fixtureType: `F${submittalLines.length + 1}`,
      configMode: 'RUN',
      qtyRequested: 1,
      indLength: "4'",
      indExactDim: '048.500"',
      borLength: "8'",
      borExactDim: '095.750"',
      morCountPerRun: 0,
      morLength: "8'",
      morExactDim: '096.000"',
      eorLength: "4'",
      eorExactDim: '048.250"',
      corCountPerRun: 0,
      corAngle: '090',
      corExactDim: '024.000"x024.000"',
      customSections: []
    };
    setSubmittalLines((prev) => [...prev, newLine]);
  };

  // Load the Attached Closed Rectangle Pattern Example (OPEN WORKPLACE 5869)
  const handleLoadAttachedPatternExample = () => {
    const patternLine = {
      id: `sub-line-pattern-${Date.now()}`,
      catalogLine:
        "SOP-CF-7'6\"x 2'CRV x19' x 2'CRV x 7'6\" x 2'CRV x19'x 2'CRV-PATTERN-I10-30-90-CL-SM-ZT2-W",
      fixtureType: 'LT04A WORKPLACE 5869',
      configMode: 'PATTERN',
      qtyRequested: 1,
      indLength: "4'",
      indExactDim: '048.500"',
      borLength: "8'",
      borExactDim: '095.750"',
      morCountPerRun: 8,
      morLength: "8'",
      morExactDim: '096.250"',
      eorLength: "4'",
      eorExactDim: '048.250"',
      corCountPerRun: 4,
      corAngle: '090',
      corExactDim: '024.000"x024.000"',
      customSections: [
        { role: 'MOR', exactDim: '096.250"', countPerRun: 4, angle: '090' },
        { role: 'MOR', exactDim: '035.500"', countPerRun: 2, angle: '090' },
        { role: 'MOR', exactDim: '090.000"', countPerRun: 2, angle: '090' },
        { role: 'COR', exactDim: '024.000"x024.000"', countPerRun: 4, angle: '090' }
      ]
    };
    setSubmittalLines((prev) => [...prev, patternLine]);
    setAnalysisBanner(
      'Added Closed Rectangle Pattern (LT04A WORKPLACE 5869): 0 BOR, 0 EOR, [096.250" (MOR) - 4 PCS], [035.500" (MOR) - 2 PCS], [090.000" (MOR) - 2 PCS], [024.000"x024.000" (COR090°) - 4 PCS].'
    );
  };

  // Helpers to manage multi-length MOR & COR segments inside a Closed Pattern line
  const handleAddPatternSegment = (lineId, roleType = 'MOR') => {
    setSubmittalLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        const currentSegs =
          Array.isArray(line.customSections) && line.customSections.length > 0
            ? [...line.customSections]
            : [
                {
                  role: 'MOR',
                  exactDim: line.morExactDim || '096.250"',
                  countPerRun: line.morCountPerRun || 4,
                  angle: line.corAngle || '090'
                },
                {
                  role: 'COR',
                  exactDim: line.corExactDim || '024.000"x024.000"',
                  countPerRun: line.corCountPerRun ?? 4,
                  angle: line.corAngle || '090'
                }
              ];
        currentSegs.push({
          role: roleType,
          exactDim: roleType === 'COR' ? '024.000"x024.000"' : '035.500"',
          countPerRun: 2,
          angle: line.corAngle || '090'
        });
        return { ...line, customSections: currentSegs };
      })
    );
  };

  const handleUpdatePatternSegment = (lineId, segIdx, field, value) => {
    setSubmittalLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        const baseSegs =
          Array.isArray(line.customSections) && line.customSections.length > 0
            ? [...line.customSections]
            : [
                {
                  role: 'MOR',
                  exactDim: line.morExactDim || '096.250"',
                  countPerRun: line.morCountPerRun || 4,
                  angle: line.corAngle || '090'
                },
                {
                  role: 'COR',
                  exactDim: line.corExactDim || '024.000"x024.000"',
                  countPerRun: line.corCountPerRun ?? 4,
                  angle: line.corAngle || '090'
                }
              ];
        baseSegs[segIdx] = { ...baseSegs[segIdx], [field]: value };
        return { ...line, customSections: baseSegs };
      })
    );
  };

  const handleRemovePatternSegment = (lineId, segIdx) => {
    setSubmittalLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        const nextSegs = (line.customSections || []).filter((_, i) => i !== segIdx);
        return { ...line, customSections: nextSegs };
      })
    );
  };

  const handleDeleteSubmittalLine = (id) => {
    setSubmittalLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleUpdatePartField = (id, field, value) => {
    setBomParts((prev) =>
      prev.map((part) => (part.id === id ? { ...part, [field]: value } : part))
    );
  };

  const handleDeletePart = (id) => {
    setBomParts((prev) => prev.filter((part) => part.id !== id));
  };

  const handleCreateManualPart = (e) => {
    e.preventDefault();
    if (!newPartForm.partNumber.trim()) return;

    const created = {
      id: `part-${Date.now()}`,
      partNumber: newPartForm.partNumber.trim(),
      description: newPartForm.description.trim() || 'CUSTOM BOM COMPONENT',
      // Always default Scope to 'ALL' ("All Sections") unless manually changed
      lengthFilter: newPartForm.lengthFilter || 'ALL',
      indUnitQty: Math.max(0, Number(newPartForm.indUnitQty) || 0),
      borUnitQty: Math.max(0, Number(newPartForm.borUnitQty) || 0),
      morUnitQty: Math.max(0, Number(newPartForm.morUnitQty) || 0),
      eorUnitQty: Math.max(0, Number(newPartForm.eorUnitQty) || 0)
    };

    setBomParts((prev) => [...prev, created]);
    setShowAddPartModal(false);
    setNewPartForm({
      partNumber: '',
      description: '',
      lengthFilter: 'ALL',
      indUnitQty: 1,
      borUnitQty: 1,
      morUnitQty: 1,
      eorUnitQty: 1
    });
  };

  // Multi-file upload handler
  const handleFileUpload = (e, targetType) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (
        file.type === 'text/csv' ||
        file.type === 'text/plain' ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.tsv') ||
        file.name.endsWith('.txt')
      ) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (targetType === 'bom') {
            setBomText((prev) => (prev ? `${prev}\n${ev.target.result}` : ev.target.result));
            setBomFiles((prev) => [
              ...prev,
              { name: file.name, mimeType: 'text/plain', base64: null }
            ]);
          } else if (targetType === 'submittal') {
            setSubmittalText((prev) =>
              prev ? `${prev}\n${ev.target.result}` : ev.target.result
            );
            setSubmittalFiles((prev) => [
              ...prev,
              { name: file.name, mimeType: 'text/plain', base64: null }
            ]);
          }
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target.result;
          const base64String = dataUrl.split(',')[1];
          const filePayload = {
            name: file.name,
            mimeType:
              file.type || (targetType === 'image' ? 'image/png' : 'application/pdf'),
            base64: base64String,
            previewUrl: targetType === 'image' ? dataUrl : null
          };
          if (targetType === 'image') {
            setImageFiles((prev) => [...prev, filePayload]);
            if (/picasso/i.test(file.name)) {
              setTicketLogoSrc(dataUrl);
              try {
                localStorage.setItem(LOCAL_STORAGE_TICKET_LOGO_KEY, dataUrl);
              } catch (err) {
                // Ignore storage quota errors
              }
            }
          } else if (targetType === 'bom') {
            setBomFiles((prev) => [...prev, filePayload]);
          } else {
            setSubmittalFiles((prev) => [...prev, filePayload]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Clear All Fields
  const handleClearAllFields = () => {
    setJobParams(createBlankJobParams());
    setSubmittalSummary(EMPTY_SUBMITTAL_SUMMARY);
    setSubmittalLines([]);
    setBomParts([]);
    setBomText('');
    setSubmittalText('');
    setImageFiles([]);
    setBomFiles([]);
    setSubmittalFiles([]);
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
    if (bomFileInputRef.current) bomFileInputRef.current.value = '';
    if (submittalFileInputRef.current) submittalFileInputRef.current.value = '';
    setSearchQuery('');
    setErrorMessage(null);
    setAnalysisBanner(
      'All fields cleared — upload or paste your Images, SD Drawings, and BOM files to start a new job.'
    );
  };

  // ==========================================================================
  // GEMINI AI SUBMITTAL & BOM ANALYZER (WITH LIVE PROMPT FIXES & SCOPE = 'ALL')
  // ==========================================================================
  const runGeminiCrossReference = async (overridePrompts = null) => {
    const activePrompts = Array.isArray(overridePrompts) ? overridePrompts : savedPrompts;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisBanner(
      activePrompts.length > 0
        ? `Running Gemini AI Analyzer + Applying ${activePrompts.length} Custom Fix Prompt(s)...`
        : 'Running Gemini AI Submittal Section Breakdown (IND / BOR / MOR / EOR / COR###°) & BOM Quantity Multiplier...'
    );

    const apiKey = customApiKey.trim() || '';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const customPromptsBlock =
      activePrompts.length > 0
        ? `\nCRITICAL USER CORRECTION PROMPTS & FIX INSTRUCTIONS (MUST OBEY AND APPLY TO CURRENT DATA):\n${activePrompts
            .map((p, idx) => `${idx + 1}. ${p}`)
            .join('\n')}`
        : '';

    const systemPrompt = `You are a Senior Manufacturing Kitting Engineer at Picasso by AXIS Lighting USA.
STANDARD SECTION TERMINOLOGY (ALWAYS USE THESE EXACT DEFINITIONS):
- BOR = Beginning of Run
- MOR = Middle of Run
- EOR = End of Run
- IND = Individual Fixture
- COR###° = Corner section with angle (e.g. COR090°, COR120°)
- BOM = Bill of Materials (parts list only—never confuse with BOR)

Follow this strict workflow when analyzing the provided Submittal Drawing(s), Bill of Materials (BOM) files (if any), and any User Correction Prompts:
Step 1: Scan each submittal drawing figure and determine how many sections each fixture/run has.
- If a figure is a single solid piece, mark its configMode as "IND" (Individual Fixture) and specify its exact length in indExactDim (e.g. "048.500\\"").
- If a figure is a linear or open run with ends, mark its configMode as "RUN" and break it down into BOR (Beginning of Run), MOR (Middle of Run), EOR (End of Run), and any corners as COR with angle corAngle (e.g. "090" for COR090°, "120" for COR120°). Always specify the exact length of each section (borExactDim, morExactDim, eorExactDim, corExactDim).
- If a figure is a closed pattern (square, rectangular, or continuous loop with no ends), mark its configMode as "PATTERN" with 0 BOR and 0 EOR. Treat ALL straight sections as MORs and all corners as COR###°. Populate customSections with every distinct MOR length and COR corner, e.g.:
      [
        { "role": "MOR", "exactDim": "096.250\\"", "countPerRun": 4, "angle": "090" },
        { "role": "MOR", "exactDim": "035.500\\"", "countPerRun": 2, "angle": "090" },
        { "role": "MOR", "exactDim": "090.000\\"", "countPerRun": 2, "angle": "090" },
        { "role": "COR", "exactDim": "024.000\\"x024.000\\"", "countPerRun": 4, "angle": "090" }
      ]
  * Format all exact lengths as 3-decimal padded inches with a quote mark (e.g. 96.25" -> "096.250\\"", 35.50" -> "035.500\\"", 90.00" -> "090.000\\"", 24.00" corners -> "024.000\\"x024.000\\"").
Step 2: Using the quantities requested on the submittal drawing, determine how many IND fixtures, BORs, MORs, EORs, and COR###° corners are in each line. Note: This Submittal Section Breakdown MUST work even when NO BOM is provided. If no BOM is uploaded or provided, return an empty array [] for bomParts while still returning the complete submittalLines, jobHeader, and submittalSummary.
Step 3: If a BOM is provided, cross-reference each IND, BOR, MOR, and EOR with the BOM. Extract the single-unit BOM quantities for IND, BOR, MOR, and EOR for each part number so they can be multiplied by the total IND, BOR, MOR, and EOR counts. Always set lengthFilter to "ALL" (Scope: All Sections) for every BOM part.
EXCLUSION RULE: Ignore and exclude any BOM parts whose Part Number starts with (case-insensitive): ${ignoredPrefixes.join(', ')}.
Step 6 & 7: Extract the Sales Order Number, Submittal Drawing Number, BOM Numbers, Revision, Name of the Project, and the exact catalog specification lines from the submittal drawing.
Step 8 (Submittal Notes Summary): Scan the Notes section and callouts on the submittal drawing and generate a concise specification summary covering these 7 fields:
- finish
- mounting
- ledDirectIndirect
- canopyColor
- suspensionCableLength
- powerCordColorAndLength
- option${customPromptsBlock}`;

    const userParts = [
      {
        text: `CURRENT HEADER PARAMETERS:
Sales Order #: ${jobParams.salesOrderNumber}
Submittal Drawing #: ${jobParams.submittalDrawingNumber}
BOM Numbers: ${jobParams.bomNumbers}
Revision: ${jobParams.revision}
Project Name: ${jobParams.projectName}

--- CURRENT SUBMITTAL NOTES SUMMARY IN APP STATE ---
${JSON.stringify(submittalSummary, null, 2)}

--- CURRENT SUBMITTAL LINES IN APP STATE ---
${JSON.stringify(submittalLines, null, 2)}

--- CURRENT BOM PARTS IN APP STATE ---
${JSON.stringify(bomParts, null, 2)}

--- USER CUSTOM FIX PROMPTS ---
${activePrompts.length > 0 ? activePrompts.join('\n') : '(None)'}

--- SUBMITTAL DRAWING NOTES / TEXT ---
${submittalText || '(See attached Submittal file or current state)'}

--- BILL OF MATERIALS (BOM) TEXT ---
${bomText || '(See attached BOM file or current state)'}
`
      }
    ];

    imageFiles.forEach((f) => {
      if (f.base64) {
        userParts.push({
          inlineData: { mimeType: f.mimeType, data: f.base64 }
        });
      }
    });

    submittalFiles.forEach((f) => {
      if (f.base64) {
        userParts.push({
          inlineData: { mimeType: f.mimeType, data: f.base64 }
        });
      }
    });

    bomFiles.forEach((f) => {
      if (f.base64) {
        userParts.push({
          inlineData: { mimeType: f.mimeType, data: f.base64 }
        });
      }
    });

    const payload = {
      contents: [{ role: 'user', parts: userParts }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summaryMessage: { type: 'STRING' },
            jobHeader: {
              type: 'OBJECT',
              properties: {
                salesOrderNumber: { type: 'STRING' },
                submittalDrawingNumber: { type: 'STRING' },
                bomNumbers: { type: 'STRING' },
                revision: { type: 'STRING' },
                projectName: { type: 'STRING' }
              },
              required: [
                'salesOrderNumber',
                'submittalDrawingNumber',
                'bomNumbers',
                'revision',
                'projectName'
              ]
            },
            submittalSummary: {
              type: 'OBJECT',
              properties: {
                finish: { type: 'STRING' },
                mounting: { type: 'STRING' },
                ledDirectIndirect: { type: 'STRING' },
                canopyColor: { type: 'STRING' },
                suspensionCableLength: { type: 'STRING' },
                powerCordColorAndLength: { type: 'STRING' },
                option: { type: 'STRING' }
              },
              required: [
                'finish',
                'mounting',
                'ledDirectIndirect',
                'canopyColor',
                'suspensionCableLength',
                'powerCordColorAndLength',
                'option'
              ]
            },
            submittalLines: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  catalogLine: { type: 'STRING' },
                  fixtureType: { type: 'STRING' },
                  configMode: { type: 'STRING', enum: ['IND', 'RUN', 'PATTERN'] },
                  qtyRequested: { type: 'NUMBER' },
                  indLength: { type: 'STRING', enum: ["4'", "8'"] },
                  indExactDim: { type: 'STRING' },
                  borLength: { type: 'STRING', enum: ["4'", "8'"] },
                  borExactDim: { type: 'STRING' },
                  morCountPerRun: { type: 'NUMBER' },
                  morLength: { type: 'STRING', enum: ["4'", "8'"] },
                  morExactDim: { type: 'STRING' },
                  eorLength: { type: 'STRING', enum: ["4'", "8'"] },
                  eorExactDim: { type: 'STRING' },
                  corCountPerRun: { type: 'NUMBER' },
                  corAngle: { type: 'STRING' },
                  corExactDim: { type: 'STRING' },
                  customSections: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        role: { type: 'STRING', enum: ['MOR', 'COR'] },
                        exactDim: { type: 'STRING' },
                        countPerRun: { type: 'NUMBER' },
                        angle: { type: 'STRING' }
                      },
                      required: ['role', 'exactDim', 'countPerRun']
                    }
                  }
                },
                required: [
                  'catalogLine',
                  'fixtureType',
                  'configMode',
                  'qtyRequested',
                  'indLength',
                  'borLength',
                  'morCountPerRun',
                  'morLength',
                  'eorLength'
                ]
              }
            },
            bomParts: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  partNumber: { type: 'STRING' },
                  description: { type: 'STRING' },
                  lengthFilter: {
                    type: 'STRING',
                    enum: ['ALL', "4'", "8'", 'AUTO_FT', 'BRACKET_RULE']
                  },
                  indUnitQty: { type: 'NUMBER' },
                  borUnitQty: { type: 'NUMBER' },
                  morUnitQty: { type: 'NUMBER' },
                  eorUnitQty: { type: 'NUMBER' }
                },
                required: [
                  'partNumber',
                  'description',
                  'lengthFilter',
                  'indUnitQty',
                  'borUnitQty',
                  'morUnitQty',
                  'eorUnitQty'
                ]
              }
            }
          },
          required: [
            'summaryMessage',
            'jobHeader',
            'submittalSummary',
            'submittalLines',
            'bomParts'
          ]
        }
      }
    };

    const fetchWithRetry = async (retries = 3, delay = 1000) => {
      // 1. On live Vercel domain (lumentatix.app), use secure /api/analyze server proxy first
      //    so GEMINI_API_KEY stays hidden on the server and staff never need to enter a key.
      if (!customApiKey.trim()) {
        try {
          const proxyRes = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-lumentatix-token': authToken || ''
            },
            body: JSON.stringify(payload)
          });
          if (proxyRes.ok) {
            return await proxyRes.json();
          }
          if (proxyRes.status === 401) {
            handleSignOut();
            throw new Error('Session expired. Please sign in again.');
          }
          // If 404 (not deployed on Vercel / running in Canvas preview), fall through to direct API
          if (proxyRes.status !== 404) {
            const errData = await proxyRes.json().catch(() => ({}));
            throw new Error(errData.error || `Server proxy returned status ${proxyRes.status}`);
          }
        } catch (proxyErr) {
          if (proxyErr.message === 'Session expired. Please sign in again.') {
            throw proxyErr;
          }
          // Fall through to direct Gemini API in Canvas preview
        }
      }

      // 2. Fallback: Direct Gemini API (Gemini Canvas preview or local custom API key)
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          return await response.json();
        } catch (err) {
          if (attempt === retries - 1) throw err;
          await new Promise((r) => setTimeout(r, delay * Math.pow(2, attempt)));
        }
      }
    };

    try {
      const result = await fetchWithRetry();
      const rawJson = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) throw new Error('Empty response from Gemini AI.');

      const parsed = JSON.parse(rawJson);

      if (parsed.jobHeader) {
        setJobParams((prev) => ({
          ...prev,
          salesOrderNumber: parsed.jobHeader.salesOrderNumber || prev.salesOrderNumber,
          submittalDrawingNumber:
            parsed.jobHeader.submittalDrawingNumber || prev.submittalDrawingNumber,
          bomNumbers: parsed.jobHeader.bomNumbers || prev.bomNumbers,
          revision: parsed.jobHeader.revision || prev.revision,
          projectName: parsed.jobHeader.projectName || prev.projectName,
          generatedDay: getFormattedCurrentDay()
        }));
      }

      if (parsed.submittalSummary) {
        setSubmittalSummary({
          finish: parsed.submittalSummary.finish || submittalSummary.finish,
          mounting: parsed.submittalSummary.mounting || submittalSummary.mounting,
          ledDirectIndirect:
            parsed.submittalSummary.ledDirectIndirect || submittalSummary.ledDirectIndirect,
          canopyColor: parsed.submittalSummary.canopyColor || submittalSummary.canopyColor,
          suspensionCableLength:
            parsed.submittalSummary.suspensionCableLength ||
            submittalSummary.suspensionCableLength,
          powerCordColorAndLength:
            parsed.submittalSummary.powerCordColorAndLength ||
            submittalSummary.powerCordColorAndLength,
          option: parsed.submittalSummary.option || submittalSummary.option
        });
      }

      if (Array.isArray(parsed.submittalLines) && parsed.submittalLines.length > 0) {
        setSubmittalLines(
          parsed.submittalLines.map((line, idx) => ({
            id: `ai-sub-${Date.now()}-${idx}`,
            catalogLine: line.catalogLine || 'VAR-SF-LINE',
            fixtureType: line.fixtureType || `F${idx + 1}`,
            configMode:
              line.configMode === 'IND'
                ? 'IND'
                : line.configMode === 'PATTERN'
                ? 'PATTERN'
                : 'RUN',
            qtyRequested: Number(line.qtyRequested) || 1,
            indLength: line.indLength === "8'" ? "8'" : "4'",
            indExactDim: line.indExactDim || (line.indLength === "8'" ? '096.250"' : '048.500"'),
            borLength: line.borLength === "4'" ? "4'" : "8'",
            borExactDim: line.borExactDim || (line.borLength === "4'" ? '047.750"' : '095.750"'),
            morCountPerRun:
              line.configMode === 'PATTERN'
                ? Math.max(1, Number(line.morCountPerRun) || 4)
                : Math.max(0, Number(line.morCountPerRun) || 0),
            morLength: line.morLength === "4'" ? "4'" : "8'",
            morExactDim: line.morExactDim || (line.morLength === "4'" ? '048.000"' : '096.000"'),
            eorLength: line.eorLength === "8'" ? "8'" : "4'",
            eorExactDim: line.eorExactDim || (line.eorLength === "8'" ? '095.825"' : '048.250"'),
            corCountPerRun:
              line.configMode === 'PATTERN'
                ? line.corCountPerRun !== undefined
                  ? Math.max(0, Number(line.corCountPerRun))
                  : 4
                : Math.max(0, Number(line.corCountPerRun) || 0),
            corAngle: String(line.corAngle || '090').replace(/[^0-9]/g, '') || '090',
            corExactDim: line.corExactDim || '024.000"x024.000"',
            customSections: Array.isArray(line.customSections)
              ? line.customSections.map((seg) => ({
                  role: seg.role === 'COR' ? 'COR' : 'MOR',
                  exactDim: seg.exactDim || '096.250"',
                  countPerRun: Math.max(0, Number(seg.countPerRun) || 1),
                  angle: String(seg.angle || line.corAngle || '090').replace(/[^0-9]/g, '') || '090'
                }))
              : []
          }))
        );
      }

      if (Array.isArray(parsed.bomParts) && parsed.bomParts.length > 0) {
        setBomParts(
          parsed.bomParts.map((p, idx) => ({
            id: `ai-part-${Date.now()}-${idx}`,
            partNumber: p.partNumber || `PART-${idx + 1}`,
            description: p.description || 'BOM Component',
            // Always set Scope dropdown to 'ALL' ("All Sections") by default; user can change manually if needed
            lengthFilter: 'ALL',
            indUnitQty: Number(p.indUnitQty) ?? 1,
            borUnitQty: Number(p.borUnitQty) ?? 1,
            morUnitQty: Number(p.morUnitQty) ?? 1,
            eorUnitQty: Number(p.eorUnitQty) ?? 1
          }))
        );
      }

      setAnalysisBanner(
        parsed.summaryMessage ||
          'AI Submittal & BOM Analysis complete — all parts set to Scope: All Sections.'
      );
    } catch (err) {
      setErrorMessage(`AI Analysis notice: ${err.message}. Using current structured breakdown.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export Clean CSV (Only Active Non-Ignored Parts)
  const handleExportCSV = () => {
    const headers = [
      'Sales Order #',
      'Project Name',
      'Submittal Drawing #',
      'Revision',
      'BOM Numbers',
      'Generated Day',
      'Deadline',
      'Issued By',
      'Released To',
      'Date/Time Released to Floor',
      'Part Number',
      'Part Description',
      'Section Scope',
      'IND Unit Qty',
      'BOR Unit Qty',
      'MOR Unit Qty',
      'EOR Unit Qty',
      'Total IND Qty',
      'Total BOR Qty',
      'Total MOR Qty',
      'Total EOR Qty',
      'Total Job Qty to Allocate'
    ];

    const rows = activePickList.map((item) => [
      jobParams.salesOrderNumber,
      `"${(jobParams.projectName || '').replace(/"/g, '""')}"`,
      jobParams.submittalDrawingNumber,
      jobParams.revision,
      `"${(jobParams.bomNumbers || '').replace(/"/g, '""')}"`,
      `"${(jobParams.generatedDay || '').replace(/"/g, '""')}"`,
      `"${(jobParams.deadline || '').replace(/"/g, '""')}"`,
      `"${(jobParams.issuedBy || '').replace(/"/g, '""')}"`,
      `"${(jobParams.releasedTo || '').replace(/"/g, '""')}"`,
      `"${(jobParams.dateTimeReleasedToFloor || '').replace(/"/g, '""')}"`,
      `"${(item.partNumber || '').replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      `"${item.sectionScopeBadge}"`,
      item.indUnitQty,
      item.borUnitQty,
      item.morUnitQty,
      item.eorUnitQty,
      item.indTotal,
      item.borTotal,
      item.morTotal,
      item.eorTotal,
      item.totalJobQty
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SO_${jobParams.salesOrderNumber || 'Job'}_${jobParams.projectName || 'Pick_List'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Universal Print Handler
  const triggerPrintNow = () => {
    setJobParams((prev) => ({
      ...prev,
      generatedDay: getFormattedCurrentDay(),
      dateTimeReleasedToFloor: prev.dateTimeReleasedToFloor || getFormattedCurrentDateTime()
    }));
    setActiveTab('print');
    setTimeout(() => {
      const printNode = printSheetRef.current;
      if (printNode) {
        try {
          const printWindow = window.open('', '_blank', 'width=1100,height=850');
          if (printWindow) {
            printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>SO #${jobParams.salesOrderNumber || 'Job'} - ${
              jobParams.projectName || APP_MAIN_TITLE
            }</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Roboto+Condensed:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @media print {
        .no-print { display: none !important; }
        body { background: #ffffff !important; color: #000000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
      body, .print-ticket-font, .print-ticket-font * {
        font-family: 'Bahnschrift Condensed', 'Bahnschrift', 'Roboto Condensed', 'Arial Narrow', sans-serif !important;
        letter-spacing: 0.01em;
      }
      .ticket-footnote-8pt {
        font-size: 8pt !important;
        line-height: 1.25 !important;
      }
      body { padding: 24px; background: #ffffff; color: #0f172a; }
    </style>
  </head>
  <body class="print-ticket-font">
    ${printNode.innerHTML}
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.focus();
          window.print();
        }, 350);
      };
    </script>
  </body>
</html>`);
            printWindow.document.close();
            return;
          }
        } catch (err) {
          // Fallback to native window.print() if popup is blocked
        }
      }
      window.focus();
      window.print();
    }, 200);
  };

  const handlePrintTicket = () => {
    triggerPrintNow();
  };

  const triggerPrintSectionTicketNow = () => {
    setJobParams((prev) => ({
      ...prev,
      generatedDay: getFormattedCurrentDay(),
      dateTimeReleasedToFloor: prev.dateTimeReleasedToFloor || getFormattedCurrentDateTime()
    }));
    setActiveTab('sectionTicket');
    setTimeout(() => {
      const printNode = sectionTicketRef.current;
      if (printNode) {
        try {
          const printWindow = window.open('', '_blank', 'width=1100,height=850');
          if (printWindow) {
            printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>SO #${jobParams.salesOrderNumber || 'Job'} - Section Breakdown Ticket</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Roboto+Condensed:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @media print {
        .no-print { display: none !important; }
        body { background: #ffffff !important; color: #000000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
      body, .print-ticket-font, .print-ticket-font * {
        font-family: 'Bahnschrift Condensed', 'Bahnschrift', 'Roboto Condensed', 'Arial Narrow', sans-serif !important;
        letter-spacing: 0.01em;
      }
      .ticket-footnote-8pt {
        font-size: 8pt !important;
        line-height: 1.25 !important;
      }
      body { padding: 24px; background: #ffffff; color: #0f172a; }
    </style>
  </head>
  <body class="print-ticket-font">
    ${printNode.innerHTML}
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.focus();
          window.print();
        }, 350);
      };
    </script>
  </body>
</html>`);
            printWindow.document.close();
            return;
          }
        } catch (err) {
          // Fallback to native window.print() if popup is blocked
        }
      }
      window.focus();
      window.print();
    }, 200);
  };

  // ==========================================================================
  // STAFF LOGIN GATE SCREEN (SHOWN UNTIL AUTHENTICATED)
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-7">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={APP_HEADER_TRANSPARENT_WHITE_LOGO}
              alt="PICASSO BY AXIS LIGHTING USA"
              className="mb-4 select-none"
              style={{ height: '58px', width: 'auto', objectFit: 'contain' }}
            />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono uppercase font-bold mb-2">
              <Lock className="w-3 h-3" />
              Authorized Staff Portal
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              LUMENTATIX
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your team passcode to access the Work Order &amp; Kitting Analyzer
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Staff Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoFocus
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Enter passcode..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-mono bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 accent-amber-500"
              />
              Keep me signed in on this device
            </label>

            {loginError && (
              <div className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-xs font-mono text-red-300">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sign In to LUMENTATIX
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-1">
            <div className="text-[11px] font-mono text-slate-400">
              {LIVE_DOMAIN} • Version {APP_VERSION}
            </div>
            <div className="text-[10px] text-slate-500">
              Preview Mode Default Passcode: <span className="font-mono text-amber-400">{PREVIEW_DEFAULT_PASSCODE}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        lightMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Print-Specific CSS & Condensed Shop Ticket Typography */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Roboto+Condensed:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');

        .print-ticket-font,
        .print-ticket-font * {
          font-family: 'Bahnschrift Condensed', 'Bahnschrift', 'Roboto Condensed', 'Arial Narrow', sans-serif !important;
          letter-spacing: 0.01em;
        }

        .ticket-footnote-8pt {
          font-size: 8pt !important;
          line-height: 1.25 !important;
        }

        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* =====================================================================
          TOP NAVIGATION BAR (WITH LARGER LOGO ALIGNED TO TOP-RIGHT SIDE)
         ===================================================================== */}
      <header
        className={`no-print sticky top-0 z-30 border-b backdrop-blur-md ${
          lightMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-900/95 border-slate-800'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-start justify-between gap-4">
          {/* Left Side: App Title, View Switcher & Action Toolbar */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-base sm:text-lg font-bold tracking-tight">
                      LUMENTATIX
                    </h1>
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      v{APP_VERSION} Saved
                    </span>
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                      IND / BOR / MOR / EOR / COR###° Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Submittal Run &amp; Pattern Breakdown &amp; Multiplied BOM Part Allocation System (Version {APP_VERSION})
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center p-1 rounded-lg border bg-slate-950 border-slate-800">
                <button
                  onClick={() => setActiveTab('workspace')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'workspace'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Kitting Workspace
                </button>
                <button
                  onClick={() => {
                    setJobParams((prev) => ({
                      ...prev,
                      generatedDay: getFormattedCurrentDay(),
                      dateTimeReleasedToFloor:
                        prev.dateTimeReleasedToFloor || getFormattedCurrentDateTime()
                    }));
                    setActiveTab('sectionTicket');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'sectionTicket'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Simple Printable Section Breakdown Ticket (Works with No BOM)"
                >
                  <Layers className="w-4 h-4" />
                  Section Breakdown Ticket (No BOM)
                </button>
                <button
                  onClick={() => {
                    setJobParams((prev) => ({
                      ...prev,
                      generatedDay: getFormattedCurrentDay(),
                      dateTimeReleasedToFloor:
                        prev.dateTimeReleasedToFloor || getFormattedCurrentDateTime()
                    }));
                    setActiveTab('print');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'print'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  Full Work Order Ticket
                </button>
              </div>
            </div>

            {/* Action Toolbar Row */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadV1Backup}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                title="Download a Version 1.6 JSON Backup of your current Job, Closed Pattern Rules, BOM, Footnote, and Ignored Prefixes"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Backup v{APP_VERSION} (.JSON)
              </button>

              <button
                onClick={() => backupRestoreInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                title="Load a saved JSON Backup file from your computer"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Load Backup File
              </button>
              <input
                ref={backupRestoreInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreV1Backup}
                className="hidden"
              />

              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  customApiKey.trim()
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Set Gemini API Key for Local Execution"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                {customApiKey.trim() ? 'API Key Saved' : 'API Key'}
              </button>

              <button
                onClick={() => setShowDeployModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25"
                title="Vercel Proxy Files & Namecheap DNS Setup for lumentatix.app"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Deploy / Domain
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                title="Lock & Sign Out of LUMENTATIX"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-400" />
                Lock
              </button>

              <button
                onClick={handleClearAllFields}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/50"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Clear All Fields
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>

              <button
                onClick={handlePrintTicket}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition"
                title="Print Full Work Order Ticket Now"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Ticket
              </button>

              <button
                onClick={triggerPrintSectionTicketNow}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow transition"
                title="Print Standalone Section Breakdown Ticket (No BOM Needed)"
              >
                <Layers className="w-3.5 h-3.5" />
                Print Section Ticket
              </button>

              <button
                onClick={() => setLightMode(!lightMode)}
                className="p-1.5 rounded-lg border transition bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                title="Toggle Light / Dark Theme"
              >
                {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Top-Right Side of App Header: Larger Picasso Logo (White Text, Orange/Amber Subtitle, Transparent Background, No Address) */}
          <div className="shrink-0 ml-auto self-start flex items-start justify-end pl-4">
            <img
              src={APP_HEADER_TRANSPARENT_WHITE_LOGO}
              alt="PICASSO BY AXIS LIGHTING USA"
              className="block select-none"
              style={{
                height: '76px',
                width: 'auto',
                objectFit: 'contain',
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN WORKSPACE CONTAINER
         ===================================================================== */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
        {/* TOP SECTION ROLLUP KPI STRIP */}
        <div className="no-print grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
          <div
            className={`p-3.5 rounded-xl border ${
              lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
              IND (Individual)
            </div>
            <div className="text-2xl font-black font-mono mt-1">{sectionRollup.totalIND}</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              4&apos;: {sectionRollup.byLength["4'"].IND} | 8&apos;: {sectionRollup.byLength["8'"].IND}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-amber-400 font-bold">
              BOR (Beg. of Run)
            </div>
            <div className="text-2xl font-black font-mono mt-1">{sectionRollup.totalBOR}</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              4&apos;: {sectionRollup.byLength["4'"].BOR} | 8&apos;: {sectionRollup.byLength["8'"].BOR}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-purple-400 font-bold">
              MOR (Mid / Closed)
            </div>
            <div className="text-2xl font-black font-mono mt-1">{sectionRollup.totalMOR}</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              4&apos;: {sectionRollup.byLength["4'"].MOR} | 8&apos;: {sectionRollup.byLength["8'"].MOR}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
              EOR (End of Run)
            </div>
            <div className="text-2xl font-black font-mono mt-1">{sectionRollup.totalEOR}</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              4&apos;: {sectionRollup.byLength["4'"].EOR} | 8&apos;: {sectionRollup.byLength["8'"].EOR}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-rose-400 font-bold">
              COR###° (Corners)
            </div>
            <div className="text-2xl font-black font-mono mt-1">{sectionRollup.totalCOR}</div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Mitered / Pattern Corners
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Total Sections
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-amber-500">
              {sectionRollup.totalSections}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Across {sectionRollup.totalFixturesAndRunsOrdered} Runs/Patterns
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Total Parts to Gather
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-emerald-400">
              {grandTotalPieces.toLocaleString()}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              {activePickList.length} Active Part #s ({excludedBomParts.length} Ignored)
            </div>
          </div>
        </div>

        {/* STATUS BANNER */}
        {analysisBanner && (
          <div
            className={`no-print mb-5 px-4 py-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs ${
              lightMode
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-medium">{analysisBanner}</span>
            </div>
            <div className="flex items-center gap-2">
              {errorMessage && <span className="text-red-400 font-mono">{errorMessage}</span>}
              <button
                onClick={handleDownloadV1Backup}
                className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-mono font-bold flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download v{APP_VERSION} Backup
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 1: KITTING WORKSPACE
           =================================================================== */}
        {activeTab === 'workspace' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* LEFT COLUMN (5 COLS): JOB & RUN PARAMETERS + FILE INPUTS */}
            <div className="xl:col-span-5 space-y-5">
              <div
                className={`p-5 rounded-xl border ${
                  lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-amber-500" />
                    Job &amp; Ticket Header / Footer Parameters
                  </h2>
                  <button
                    onClick={handleClearAllFields}
                    className="text-[11px] font-mono text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </div>

                {/* Job & Ticket Header Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Name of the Project
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Project Name..."
                      value={jobParams.projectName}
                      onChange={(e) =>
                        setJobParams({ ...jobParams, projectName: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-bold border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Sales Order Number (SO #)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter SO #..."
                      value={jobParams.salesOrderNumber}
                      onChange={(e) =>
                        setJobParams({ ...jobParams, salesOrderNumber: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono font-bold border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-amber-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Revision (Rev. No.)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Revision..."
                      value={jobParams.revision}
                      onChange={(e) =>
                        setJobParams({ ...jobParams, revision: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Submittal Drawing Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Submittal Drawing #..."
                      value={jobParams.submittalDrawingNumber}
                      onChange={(e) =>
                        setJobParams({ ...jobParams, submittalDrawingNumber: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-cyan-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      BOM Numbers
                    </label>
                    <input
                      type="text"
                      placeholder="Enter BOM #..."
                      value={jobParams.bomNumbers}
                      onChange={(e) =>
                        setJobParams({ ...jobParams, bomNumbers: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-emerald-300'
                      }`}
                    />
                  </div>

                  {/* Ticket Header Fields */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-amber-400 mb-1">
                      1. Current Day (Ticket Generated)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={jobParams.generatedDay || ''}
                        onChange={(e) =>
                          setJobParams({ ...jobParams, generatedDay: e.target.value })
                        }
                        placeholder="Current Day..."
                        className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-slate-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setJobParams({ ...jobParams, generatedDay: getFormattedCurrentDay() })
                        }
                        className="px-2 py-2 rounded-lg border border-slate-700 bg-slate-800 text-[10px] font-mono text-amber-400 hover:bg-slate-700 shrink-0"
                        title="Refresh Current Day"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-amber-400 mb-1">
                      2. Deadline [Date]
                    </label>
                    <input
                      type="date"
                      value={jobParams.deadline || ''}
                      onChange={(e) =>
                        setJobParams({ ...jobParams, deadline: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-amber-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-cyan-400 mb-1">
                      3. Issued By [First Name Last Name]
                    </label>
                    <input
                      type="text"
                      placeholder="First Name Last Name"
                      value={jobParams.issuedBy || ''}
                      onChange={(e) =>
                        setJobParams({ ...jobParams, issuedBy: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-emerald-400 mb-1">
                      4. Released To [First Name Last Name]
                    </label>
                    <input
                      type="text"
                      placeholder="First Name Last Name"
                      value={jobParams.releasedTo || ''}
                      onChange={(e) =>
                        setJobParams({ ...jobParams, releasedTo: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase text-purple-400 mb-1">
                      Date / Time Released to Floor (Header)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Date / Time Released to Floor..."
                        value={jobParams.dateTimeReleasedToFloor || ''}
                        onChange={(e) =>
                          setJobParams({
                            ...jobParams,
                            dateTimeReleasedToFloor: e.target.value
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-purple-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setJobParams({
                            ...jobParams,
                            dateTimeReleasedToFloor: getFormattedCurrentDateTime()
                          })
                        }
                        className="px-2.5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-[10px] font-mono text-purple-300 hover:bg-slate-700 shrink-0"
                      >
                        Now
                      </button>
                    </div>
                  </div>

                  {/* Ticket Footer Footnote (8pt Font on Ticket) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase text-amber-400 mb-1">
                      Ticket Footer Footnote (Renders in 8pt Font on Ticket)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter footer footnote text for the ticket..."
                      value={jobParams.ticketFootnote ?? DEFAULT_TICKET_FOOTNOTE}
                      onChange={(e) =>
                        setJobParams({
                          ...jobParams,
                          ticketFootnote: e.target.value
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                        lightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* SUBMITTAL NOTES SPECIFICATION SUMMARY BLOCK */}
                <div className="border-t border-slate-800 pt-4 mb-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4" />
                        Submittal Summary (Based on Drawing Notes)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Automatically populated by Gemini AI from Submittal Notes or editable manually
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleParseNotesSummaryLocally}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition"
                      title="Extract summary fields directly from the Submittal Notes text box"
                    >
                      <Sparkles className="w-3 h-3" />
                      Extract from Notes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                        1. Finish
                      </label>
                      <input
                        type="text"
                        placeholder="Finish..."
                        value={submittalSummary.finish}
                        onChange={(e) =>
                          setSubmittalSummary({ ...submittalSummary, finish: e.target.value })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-slate-100'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                        2. Mounting
                      </label>
                      <input
                        type="text"
                        placeholder="Mounting..."
                        value={submittalSummary.mounting}
                        onChange={(e) =>
                          setSubmittalSummary({ ...submittalSummary, mounting: e.target.value })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-slate-100'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                        3. LED Direct / Indirect
                      </label>
                      <input
                        type="text"
                        placeholder="LED Direct / Indirect..."
                        value={submittalSummary.ledDirectIndirect}
                        onChange={(e) =>
                          setSubmittalSummary({
                            ...submittalSummary,
                            ledDirectIndirect: e.target.value
                          })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-cyan-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                        4. Canopy Color
                      </label>
                      <input
                        type="text"
                        placeholder="Canopy Color..."
                        value={submittalSummary.canopyColor}
                        onChange={(e) =>
                          setSubmittalSummary({
                            ...submittalSummary,
                            canopyColor: e.target.value
                          })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-slate-100'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                        5. Suspension Cable Length
                      </label>
                      <input
                        type="text"
                        placeholder="Suspension Cable Length..."
                        value={submittalSummary.suspensionCableLength}
                        onChange={(e) =>
                          setSubmittalSummary({
                            ...submittalSummary,
                            suspensionCableLength: e.target.value
                          })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-slate-100'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                        6. Power Cord Color &amp; Length
                      </label>
                      <input
                        type="text"
                        placeholder="Power Cord Color & Length..."
                        value={submittalSummary.powerCordColorAndLength}
                        onChange={(e) =>
                          setSubmittalSummary({
                            ...submittalSummary,
                            powerCordColorAndLength: e.target.value
                          })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-slate-100'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                        7. Option
                      </label>
                      <input
                        type="text"
                        placeholder="Options..."
                        value={submittalSummary.option}
                        onChange={(e) =>
                          setSubmittalSummary({ ...submittalSummary, option: e.target.value })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                          lightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-emerald-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Submittal Fixture & Run Lines with Section Length Breakdown */}
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        Submittal Line Breakdown (IND / BOR / MOR / EOR / COR###°)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Closed Pattern = 0 BOR, 0 EOR, multi-length MORs + COR###° | Works with or without BOM
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleLoadAttachedPatternExample}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1 transition"
                        title="Load the Closed Rectangle Pattern from your attached drawing (LT04A WORKPLACE 5869)"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Load Attached Pattern
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('sectionTicket')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition"
                        title="Open Simple Printable Section Breakdown Ticket"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Section Ticket
                      </button>
                      <button
                        onClick={handleAddSubmittalLine}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Line
                      </button>
                    </div>
                  </div>

                  {sectionRollup.lineBreakdowns.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-slate-700 text-center text-xs text-slate-400 font-mono">
                      No submittal lines added yet. Upload an SD Drawing (no BOM required) and click Analyze with Gemini AI, or click &ldquo;Add Line&rdquo;.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sectionRollup.lineBreakdowns.map((line, index) => (
                        <div
                          key={line.id}
                          className={`p-3 rounded-xl border transition ${
                            lightMode
                              ? 'bg-slate-50 border-slate-300'
                              : 'bg-slate-950/90 border-slate-800'
                          }`}
                        >
                          {/* Top Row: Catalog Spec Line & Delete */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              #{index + 1}
                            </span>
                            <input
                              type="text"
                              placeholder="Enter Submittal Line Name / Catalog Spec..."
                              value={line.catalogLine}
                              onChange={(e) =>
                                handleUpdateSubmittalLine(line.id, 'catalogLine', e.target.value)
                              }
                              className="flex-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-sky-500/15 border border-sky-500/40 text-sky-300 focus:outline-none focus:border-sky-400"
                              title="Submittal Line Name"
                            />
                            <button
                              onClick={() => handleDeleteSubmittalLine(line.id)}
                              className="text-slate-500 hover:text-red-400 p-1"
                              title="Remove Submittal Line"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Controls Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end text-xs">
                            <div>
                              <label className="block text-[10px] font-mono text-slate-400">
                                Type
                              </label>
                              <input
                                type="text"
                                value={line.fixtureType}
                                onChange={(e) =>
                                  handleUpdateSubmittalLine(line.id, 'fixtureType', e.target.value)
                                }
                                className={`w-full px-2 py-1 rounded font-mono text-xs border ${
                                  lightMode
                                    ? 'bg-white border-slate-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-200'
                                }`}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-emerald-400 font-bold">
                                Qty Req.
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={line.qtyRequested}
                                onChange={(e) =>
                                  handleUpdateSubmittalLine(
                                    line.id,
                                    'qtyRequested',
                                    Math.max(0, Number(e.target.value) || 0)
                                  )
                                }
                                className="w-full px-2 py-1 rounded font-mono font-black text-xs bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 focus:outline-none"
                              />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                              <label className="block text-[10px] font-mono text-slate-400">
                                Config
                              </label>
                              <select
                                value={line.configMode}
                                onChange={(e) => {
                                  const nextMode = e.target.value;
                                  handleUpdateSubmittalLine(line.id, 'configMode', nextMode);
                                  if (nextMode === 'PATTERN') {
                                    if (
                                      !Array.isArray(line.customSections) ||
                                      line.customSections.length === 0
                                    ) {
                                      handleUpdateSubmittalLine(line.id, 'customSections', [
                                        {
                                          role: 'MOR',
                                          exactDim: line.morExactDim || '096.250"',
                                          countPerRun: 4,
                                          angle: line.corAngle || '090'
                                        },
                                        {
                                          role: 'MOR',
                                          exactDim: '035.500"',
                                          countPerRun: 2,
                                          angle: line.corAngle || '090'
                                        },
                                        {
                                          role: 'MOR',
                                          exactDim: '090.000"',
                                          countPerRun: 2,
                                          angle: line.corAngle || '090'
                                        },
                                        {
                                          role: 'COR',
                                          exactDim: line.corExactDim || '024.000"x024.000"',
                                          countPerRun: 4,
                                          angle: line.corAngle || '090'
                                        }
                                      ]);
                                    }
                                  }
                                }}
                                className={`w-full px-1.5 py-1 rounded font-mono text-xs border ${
                                  lightMode
                                    ? 'bg-white border-slate-300'
                                    : 'bg-slate-900 border-slate-700 text-amber-400'
                                }`}
                              >
                                <option value="IND">IND (Solid 1-Pc)</option>
                                <option value="RUN">RUN (BOR/MOR/EOR)</option>
                                <option value="PATTERN">CLOSED PATTERN (MOR+COR)</option>
                              </select>
                            </div>

                            {line.configMode === 'IND' ? (
                              <div className="col-span-2 sm:col-span-3">
                                <label className="block text-[10px] font-mono text-cyan-400">
                                  IND Nominal Section Length
                                </label>
                                <select
                                  value={line.indLength}
                                  onChange={(e) =>
                                    handleUpdateSubmittalLine(line.id, 'indLength', e.target.value)
                                  }
                                  className={`w-full px-2 py-1 rounded font-mono text-xs border ${
                                    lightMode
                                      ? 'bg-white border-slate-300'
                                      : 'bg-slate-900 border-slate-700 text-cyan-300'
                                  }`}
                                >
                                  <option value="4'">4&apos;-0&quot; [048.500&quot;] (IND)</option>
                                  <option value="8'">8&apos;-0&quot; [096.250&quot;] (IND)</option>
                                </select>
                              </div>
                            ) : line.configMode === 'PATTERN' ? (
                              <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAddPatternSegment(line.id, 'MOR')}
                                  className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40"
                                >
                                  + Add MOR Length
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddPatternSegment(line.id, 'COR')}
                                  className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
                                >
                                  + Add Corner (COR###°)
                                </button>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label className="block text-[10px] font-mono text-amber-400">
                                    BOR Len
                                  </label>
                                  <select
                                    value={line.borLength}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'borLength',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-1.5 py-1 rounded font-mono text-xs border ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-amber-300'
                                    }`}
                                  >
                                    <option value="8'">8&apos; BOR</option>
                                    <option value="4'">4&apos; BOR</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-mono text-purple-400">
                                    MOR / Run
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={line.morCountPerRun}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'morCountPerRun',
                                        Math.max(0, Number(e.target.value) || 0)
                                      )
                                    }
                                    className={`w-full px-2 py-1 rounded font-mono text-xs border ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-purple-300'
                                    }`}
                                    title="Number of MOR sections per single run"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-mono text-emerald-400">
                                    EOR Len
                                  </label>
                                  <select
                                    value={line.eorLength}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'eorLength',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-1.5 py-1 rounded font-mono text-xs border ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-emerald-300'
                                    }`}
                                  >
                                    <option value="4'">4&apos; EOR</option>
                                    <option value="8'">8&apos; EOR</option>
                                  </select>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Exact Decimal Section Length Inputs (Always Specify Length of Each Section) */}
                          {line.configMode === 'IND' ? (
                            <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] font-mono">
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] text-cyan-400 font-bold">
                                  IND Exact Section Length:
                                </label>
                                <input
                                  type="text"
                                  value={line.indExactDim || '048.500"'}
                                  onChange={(e) =>
                                    handleUpdateSubmittalLine(
                                      line.id,
                                      'indExactDim',
                                      e.target.value
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded border text-xs ${
                                    lightMode
                                      ? 'bg-white border-slate-300'
                                      : 'bg-slate-900 border-slate-700 text-cyan-300'
                                  }`}
                                />
                              </div>
                            </div>
                          ) : line.configMode === 'PATTERN' ? (
                            <div className="mt-2 space-y-1.5 text-[10px] font-mono">
                              <div className="text-[10px] text-purple-300 font-bold">
                                Closed Pattern Sections (No BOR / No EOR — All straight sides are MORs + Corners are COR###°):
                              </div>
                              {(Array.isArray(line.customSections) && line.customSections.length > 0
                                ? line.customSections
                                : [
                                    {
                                      role: 'MOR',
                                      exactDim: line.morExactDim || '096.250"',
                                      countPerRun: line.morCountPerRun || 4,
                                      angle: line.corAngle || '090'
                                    },
                                    {
                                      role: 'COR',
                                      exactDim: line.corExactDim || '024.000"x024.000"',
                                      countPerRun: line.corCountPerRun ?? 4,
                                      angle: line.corAngle || '090'
                                    }
                                  ]
                              ).map((seg, segIdx) => (
                                <div
                                  key={segIdx}
                                  className="grid grid-cols-12 gap-1.5 items-center bg-slate-900/60 p-1.5 rounded border border-slate-800"
                                >
                                  <div className="col-span-3">
                                    <select
                                      value={seg.role === 'COR' ? 'COR' : 'MOR'}
                                      onChange={(e) =>
                                        handleUpdatePatternSegment(
                                          line.id,
                                          segIdx,
                                          'role',
                                          e.target.value
                                        )
                                      }
                                      className={`w-full px-1.5 py-0.5 rounded border text-[11px] font-bold ${
                                        seg.role === 'COR'
                                          ? 'text-rose-300 border-rose-500/40 bg-rose-500/10'
                                          : 'text-purple-300 border-purple-500/40 bg-purple-500/10'
                                      }`}
                                    >
                                      <option value="MOR">MOR (Straight)</option>
                                      <option value="COR">COR###° (Corner)</option>
                                    </select>
                                  </div>

                                  <div className="col-span-4">
                                    <input
                                      type="text"
                                      value={seg.exactDim || ''}
                                      onChange={(e) =>
                                        handleUpdatePatternSegment(
                                          line.id,
                                          segIdx,
                                          'exactDim',
                                          e.target.value
                                        )
                                      }
                                      placeholder='e.g. 096.250" or 035.500"'
                                      className={`w-full px-1.5 py-0.5 rounded border text-[11px] ${
                                        lightMode
                                          ? 'bg-white border-slate-300'
                                          : 'bg-slate-950 border-slate-700 text-slate-100'
                                      }`}
                                      title="Exact Section Length"
                                    />
                                  </div>

                                  <div className="col-span-2 flex items-center gap-1">
                                    <span className="text-slate-400">Qty:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={seg.countPerRun ?? 1}
                                      onChange={(e) =>
                                        handleUpdatePatternSegment(
                                          line.id,
                                          segIdx,
                                          'countPerRun',
                                          Math.max(0, Number(e.target.value) || 0)
                                        )
                                      }
                                      className={`w-full px-1.5 py-0.5 rounded border text-[11px] font-bold ${
                                        lightMode
                                          ? 'bg-white border-slate-300'
                                          : 'bg-slate-950 border-slate-700 text-emerald-300'
                                      }`}
                                      title="Pieces per Pattern"
                                    />
                                  </div>

                                  <div className="col-span-2">
                                    {seg.role === 'COR' ? (
                                      <input
                                        type="text"
                                        value={seg.angle || '090'}
                                        onChange={(e) =>
                                          handleUpdatePatternSegment(
                                            line.id,
                                            segIdx,
                                            'angle',
                                            e.target.value
                                          )
                                        }
                                        placeholder="090°"
                                        className="w-full px-1.5 py-0.5 rounded border border-rose-500/40 bg-slate-950 text-rose-300 text-[11px]"
                                        title="Corner Angle (e.g. 090 -> COR090°)"
                                      />
                                    ) : (
                                      <span className="text-slate-500 text-[10px] pl-1">
                                        MOR Side
                                      </span>
                                    )}
                                  </div>

                                  <div className="col-span-1 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePatternSegment(line.id, segIdx)}
                                      className="text-slate-500 hover:text-red-400 font-bold px-1"
                                      title="Remove Segment"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 space-y-2 text-[10px] font-mono">
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-amber-400">BOR Exact Dim</label>
                                  <input
                                    type="text"
                                    value={line.borExactDim || '095.750"'}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'borExactDim',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-1.5 py-0.5 rounded border text-[11px] ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-amber-300'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-purple-400">MOR Exact Dim</label>
                                  <input
                                    type="text"
                                    value={line.morExactDim || '096.000"'}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'morExactDim',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-1.5 py-0.5 rounded border text-[11px] ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-purple-300'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-emerald-400">EOR Exact Dim</label>
                                  <input
                                    type="text"
                                    value={line.eorExactDim || '095.825"'}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'eorExactDim',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-1.5 py-0.5 rounded border text-[11px] ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-emerald-300'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Optional Corners on Open/Linear Runs (L-shape, U-shape, etc.) */}
                              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60">
                                <div>
                                  <label className="block text-rose-400">COR / Run (Optional)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={line.corCountPerRun || 0}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'corCountPerRun',
                                        Math.max(0, Number(e.target.value) || 0)
                                      )
                                    }
                                    className={`w-full px-1.5 py-0.5 rounded border text-[11px] ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-rose-300'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-rose-400">COR Angle (###°)</label>
                                  <input
                                    type="text"
                                    value={line.corAngle || '090'}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'corAngle',
                                        e.target.value
                                      )
                                    }
                                    placeholder="090"
                                    className={`w-full px-1.5 py-0.5 rounded border text-[11px] ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-rose-300'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-rose-400">COR Exact Length</label>
                                  <input
                                    type="text"
                                    value={line.corExactDim || '024.000"x024.000"'}
                                    onChange={(e) =>
                                      handleUpdateSubmittalLine(
                                        line.id,
                                        'corExactDim',
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-1.5 py-0.5 rounded border text-[11px] ${
                                      lightMode
                                        ? 'bg-white border-slate-300'
                                        : 'bg-slate-900 border-slate-700 text-rose-300'
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Formatted Section Length Breakdown Output */}
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                            <span className="text-slate-400">Line Breakdown:</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {line.formattedLengthTags.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3 SEPARATE UPLOAD FIELDS (IMAGES, SD DRAWINGS, BOMS) + AI ENGINE */}
              <div
                className={`p-5 rounded-xl border space-y-5 ${
                  lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-500" />
                      Document &amp; File Uploads
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Upload Images, SD Drawings, and BOMs in the 3 dedicated fields below
                    </p>
                  </div>
                </div>

                {/* 1. IMAGES UPLOAD FIELD & BUTTON */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    lightMode
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                        <ImageIcon className="w-4 h-4" />
                        1. Images Upload
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Images
                    </button>
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                    />
                  </div>

                  {imageFiles.length === 0 ? (
                    <div className="py-2 px-3 rounded border border-dashed border-slate-800 text-[11px] font-mono text-slate-500 text-center">
                      No image files uploaded yet. Click &ldquo;Upload Images&rdquo; to attach files.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {imageFiles.map((f, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-[11px] font-mono text-purple-300 flex items-center gap-2"
                        >
                          {f.previewUrl && (
                            <img
                              src={f.previewUrl}
                              alt={f.name}
                              className="w-6 h-6 rounded object-cover border border-purple-400/40"
                            />
                          )}
                          <span className="max-w-[180px] truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setImageFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-red-400 hover:text-red-300 font-bold ml-1"
                            title="Remove Image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. SD DRAWINGS UPLOAD FIELD & BUTTON */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    lightMode
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                        <FileText className="w-4 h-4" />
                        2. SD Drawings Upload
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => submittalFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload SD
                    </button>
                    <input
                      ref={submittalFileInputRef}
                      type="file"
                      multiple
                      accept="application/pdf,image/*,.txt,.dwg"
                      onChange={(e) => handleFileUpload(e, 'submittal')}
                      className="hidden"
                    />
                  </div>

                  {submittalFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {submittalFiles.map((f, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-1.5"
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="max-w-[200px] truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSubmittalFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-red-400 hover:text-red-300 font-bold ml-1"
                            title="Remove SD Drawing"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <textarea
                    rows={3}
                    value={submittalText}
                    onChange={(e) => setSubmittalText(e.target.value)}
                    placeholder="Optional: Paste SD Drawing text or notes here..."
                    className={`w-full p-2.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                      lightMode
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  />
                </div>

                {/* 3. BOMS UPLOAD FIELD & BUTTON */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    lightMode
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
                        <FileSpreadsheet className="w-4 h-4" />
                        3. BOMs Upload
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => bomFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload BOMs
                    </button>
                    <input
                      ref={bomFileInputRef}
                      type="file"
                      multiple
                      accept="application/pdf,.csv,.tsv,.txt,.xlsx,.xls,image/*"
                      onChange={(e) => handleFileUpload(e, 'bom')}
                      className="hidden"
                    />
                  </div>

                  {bomFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {bomFiles.map((f, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5"
                        >
                          <FileSpreadsheet className="w-3 h-3 shrink-0" />
                          <span className="max-w-[200px] truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setBomFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-red-400 hover:text-red-300 font-bold ml-1"
                            title="Remove BOM File"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <textarea
                    rows={3}
                    value={bomText}
                    onChange={(e) => setBomText(e.target.value)}
                    placeholder="Optional: Paste BOM table or part rows here..."
                    className={`w-full p-2.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-cyan-400 ${
                      lightMode
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  />
                </div>

                <button
                  onClick={() => runGeminiCrossReference()}
                  disabled={isAnalyzing}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning Submittal Sections &amp; Multiplying BOM...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze Images, SD Drawings &amp; BOMs with Gemini AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN (7 COLS): INTERACTIVE SHOP KITTING & ALLOCATION PICK LIST */}
            <div className="xl:col-span-7">
              <div
                className={`p-5 rounded-xl border ${
                  lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-500" />
                      Interactive Shop Kitting &amp; Allocation Pick List
                    </h2>
                    <p className="text-xs text-slate-400">
                      Multiplies single-unit BOM quantities by {sectionRollup.totalIND} IND,{' '}
                      {sectionRollup.totalBOR} BOR, {sectionRollup.totalMOR} MOR, and{' '}
                      {sectionRollup.totalEOR} EOR sections (Scope defaults to All Sections)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center p-0.5 rounded-lg border text-xs font-mono ${
                        lightMode ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => setViewGrouping('consolidated')}
                        className={`px-2.5 py-1 rounded-md transition ${
                          viewGrouping === 'consolidated'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Consolidated
                      </button>
                      <button
                        onClick={() => setViewGrouping('bySection')}
                        className={`px-2.5 py-1 rounded-md transition ${
                          viewGrouping === 'bySection'
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        By Section (IND/BOR/MOR/EOR)
                      </button>
                    </div>

                    <button
                      onClick={() => setShowAddPartModal(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Part Row
                    </button>
                  </div>
                </div>

                {/* Simple Search Input */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Pick List by Part Number or Description..."
                    className={`w-full pl-9 pr-16 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                      lightMode
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* VIEW 1: CONSOLIDATED PICK LIST TABLE */}
                {viewGrouping === 'consolidated' ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr
                          className={`border-b text-[11px] font-mono uppercase tracking-wider ${
                            lightMode
                              ? 'bg-slate-100 border-slate-300 text-slate-600'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <th className="py-3 px-3">Part Number</th>
                          <th className="py-3 px-3">Part Description</th>
                          <th className="py-3 px-3 text-center">
                            Unit Qty per Section (IND / BOR / MOR / EOR)
                          </th>
                          <th className="py-3 px-3">Section Multiplier Breakdown</th>
                          <th className="py-3 px-3 text-right">Total Job Qty</th>
                          <th className="py-3 px-2 text-center">Del</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {filteredPickList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                              No BOM parts loaded yet. Upload your BOM &amp; SD Drawing or click &ldquo;Add Part Row&rdquo;.
                            </td>
                          </tr>
                        ) : (
                          filteredPickList.map((item) => (
                            <tr
                              key={item.id}
                              className={`transition-colors ${
                                lightMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                              }`}
                            >
                              {/* Editable Part Number & Scope Dropdown (Always defaults to 'ALL') */}
                              <td className="py-3 px-3 align-top min-w-[160px]">
                                <input
                                  type="text"
                                  value={item.partNumber}
                                  onChange={(e) =>
                                    handleUpdatePartField(item.id, 'partNumber', e.target.value)
                                  }
                                  className={`w-full px-2 py-1 rounded font-mono font-bold text-xs border focus:outline-none focus:border-amber-500 ${
                                    lightMode
                                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                                      : 'bg-slate-950 border-slate-800 text-amber-400'
                                  }`}
                                />
                                <div className="mt-1">
                                  <select
                                    value={item.lengthFilter || 'ALL'}
                                    onChange={(e) =>
                                      handleUpdatePartField(item.id, 'lengthFilter', e.target.value)
                                    }
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                      lightMode
                                        ? 'bg-slate-100 border-slate-300 text-slate-700'
                                        : 'bg-slate-900 border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    <option value="ALL">Scope: All Sections</option>
                                    <option value="4'">Scope: 4&apos; Sections Only</option>
                                    <option value="8'">Scope: 8&apos; Sections Only</option>
                                    <option value="AUTO_FT">Rule: 4 per 4&apos; / 8 per 8&apos;</option>
                                    <option value="BRACKET_RULE">Rule: 2 (&lt;=4&apos;) / 3 (8&apos;)</option>
                                  </select>
                                </div>
                              </td>

                              {/* Editable Part Description */}
                              <td className="py-3 px-3 align-top min-w-[230px]">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleUpdatePartField(item.id, 'description', e.target.value)
                                  }
                                  className={`w-full px-2 py-1 rounded text-xs border focus:outline-none focus:border-amber-500 ${
                                    lightMode
                                      ? 'bg-slate-50 border-slate-300 text-slate-800'
                                      : 'bg-slate-950 border-slate-800 text-slate-200'
                                  }`}
                                />
                              </td>

                              {/* Unit Qty per IND / BOR / MOR / EOR */}
                              <td className="py-3 px-3 align-top">
                                <div className="grid grid-cols-4 gap-1 text-center font-mono">
                                  <div>
                                    <span className="block text-[9px] text-cyan-400">IND</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.indUnitQty}
                                      onChange={(e) =>
                                        handleUpdatePartField(
                                          item.id,
                                          'indUnitQty',
                                          Math.max(0, Number(e.target.value) || 0)
                                        )
                                      }
                                      className={`w-11 px-1 py-0.5 text-center rounded border text-xs ${
                                        lightMode
                                          ? 'bg-white border-slate-300'
                                          : 'bg-slate-950 border-slate-700 text-cyan-300'
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <span className="block text-[9px] text-amber-400">BOR</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.borUnitQty}
                                      onChange={(e) =>
                                        handleUpdatePartField(
                                          item.id,
                                          'borUnitQty',
                                          Math.max(0, Number(e.target.value) || 0)
                                        )
                                      }
                                      className={`w-11 px-1 py-0.5 text-center rounded border text-xs ${
                                        lightMode
                                          ? 'bg-white border-slate-300'
                                          : 'bg-slate-950 border-slate-700 text-amber-300'
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <span className="block text-[9px] text-purple-400">MOR</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.morUnitQty}
                                      onChange={(e) =>
                                        handleUpdatePartField(
                                          item.id,
                                          'morUnitQty',
                                          Math.max(0, Number(e.target.value) || 0)
                                        )
                                      }
                                      className={`w-11 px-1 py-0.5 text-center rounded border text-xs ${
                                        lightMode
                                          ? 'bg-white border-slate-300'
                                          : 'bg-slate-950 border-slate-700 text-purple-300'
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <span className="block text-[9px] text-emerald-400">EOR</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.eorUnitQty}
                                      onChange={(e) =>
                                        handleUpdatePartField(
                                          item.id,
                                          'eorUnitQty',
                                          Math.max(0, Number(e.target.value) || 0)
                                        )
                                      }
                                      className={`w-11 px-1 py-0.5 text-center rounded border text-xs ${
                                        lightMode
                                          ? 'bg-white border-slate-300'
                                          : 'bg-slate-950 border-slate-700 text-emerald-300'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Multiplier Breakdown Trace */}
                              <td className="py-3 px-3 align-top font-mono text-[11px]">
                                <div className="flex flex-wrap gap-1.5 mb-1">
                                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                    IND: {item.indTotal}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                    BOR: {item.borTotal}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                    MOR: {item.morTotal}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                    EOR: {item.eorTotal}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400">{item.mathTrace}</div>
                              </td>

                              {/* Total Job Qty to Gather */}
                              <td className="py-3 px-3 align-top text-right">
                                <span className="inline-block px-3 py-1 rounded-lg font-mono font-black text-base bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                                  {item.totalJobQty.toLocaleString()}
                                </span>
                              </td>

                              {/* Delete Row */}
                              <td className="py-3 px-2 align-top text-center">
                                <button
                                  onClick={() => handleDeletePart(item.id)}
                                  className="text-slate-500 hover:text-red-400 p-1"
                                  title="Delete Part Row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* VIEW 2: GROUPED BY SECTION TYPE (IND / BOR / MOR / EOR) */
                  <div className="space-y-4">
                    {[
                      {
                        key: 'IND',
                        title: `IND (Individual Fixtures) — Qty Requested: ${sectionRollup.totalIND}`,
                        totalField: 'indTotal',
                        unitField: 'indUnitQty',
                        badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      },
                      {
                        key: 'BOR',
                        title: `BOR (Beginning of Run Sections) — Qty Requested: ${sectionRollup.totalBOR}`,
                        totalField: 'borTotal',
                        unitField: 'borUnitQty',
                        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      },
                      {
                        key: 'MOR',
                        title: `MOR (Middle of Run Sections) — Qty Requested: ${sectionRollup.totalMOR}`,
                        totalField: 'morTotal',
                        unitField: 'morUnitQty',
                        badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      },
                      {
                        key: 'EOR',
                        title: `EOR (End of Run Sections) — Qty Requested: ${sectionRollup.totalEOR}`,
                        totalField: 'eorTotal',
                        unitField: 'eorUnitQty',
                        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }
                    ].map((group) => {
                      const groupItems = filteredPickList.filter(
                        (it) => it[group.totalField] > 0
                      );
                      return (
                        <div
                          key={group.key}
                          className="rounded-xl border border-slate-800 overflow-hidden"
                        >
                          <div
                            className={`px-4 py-2.5 border-b border-slate-800 flex items-center justify-between font-mono text-xs font-bold ${group.badgeClass}`}
                          >
                            <span>{group.title}</span>
                            <span>{groupItems.length} Active Part Lines</span>
                          </div>
                          {groupItems.length === 0 ? (
                            <div className="p-4 text-xs font-mono text-slate-400">
                              0 parts required for {group.key} sections on this order.
                            </div>
                          ) : (
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                                  <th className="py-2 px-3">Part Number</th>
                                  <th className="py-2 px-3">Part Description</th>
                                  <th className="py-2 px-3 text-right">Single Unit Qty</th>
                                  <th className="py-2 px-3 text-right">
                                    Allocated {group.key} Qty
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/50">
                                {groupItems.map((it) => (
                                  <tr key={`${group.key}-${it.id}`}>
                                    <td className="py-2 px-3 font-mono font-bold text-amber-400">
                                      {it.partNumber}
                                    </td>
                                    <td className="py-2 px-3">{it.description}</td>
                                    <td className="py-2 px-3 text-right font-mono">
                                      {it[group.unitField]}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono font-black text-emerald-400">
                                      {it[group.totalField].toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AI PROMPT & LIVE FIX INSTRUCTIONS FORM CARD */}
              <div
                className={`mt-5 p-5 rounded-xl border ${
                  lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <MessageSquarePlus className="w-4 h-4 text-amber-500" />
                      AI Prompts &amp; Live Fix Instructions
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Add custom prompts or correction rules to fix quantities, section lengths, or part mappings right inside the app.
                    </p>
                  </div>
                  {savedPrompts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSavedPrompts([])}
                      className="text-[11px] font-mono text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Prompts ({savedPrompts.length})
                    </button>
                  )}
                </div>

                <form onSubmit={handleAddPromptRule} className="space-y-2.5 mb-3">
                  <textarea
                    rows={2}
                    value={newPromptInput}
                    onChange={(e) => setNewPromptInput(e.target.value)}
                    placeholder="Type a prompt to fix or adjust anything..."
                    className={`w-full p-2.5 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                      lightMode
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="submit"
                      disabled={!newPromptInput.trim()}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 transition disabled:opacity-40 ${
                        lightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      Save Rule to Prompt List
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyPromptFixNow}
                      disabled={isAnalyzing || (!newPromptInput.trim() && savedPrompts.length === 0)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow transition disabled:opacity-40"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Applying Fix...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Apply Prompt Fix Now with AI
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Active Saved Prompts List */}
                {savedPrompts.length === 0 ? (
                  <div className="text-xs font-mono text-slate-500 italic">
                    No custom fix prompts saved yet. Add a prompt above to guide or correct the AI analyzer.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {savedPrompts.map((promptText, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-start justify-between gap-2 ${
                          lightMode
                            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">#{idx + 1}</span>
                          <span>{promptText}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePromptRule(idx)}
                          className="text-slate-400 hover:text-red-400 font-bold shrink-0"
                          title="Remove Prompt Rule"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* IGNORED BOM PART PREFIXES / EXCLUSION FILTER FORM CARD */}
              <div
                className={`mt-5 p-5 rounded-xl border ${
                  lightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Filter className="w-4 h-4 text-amber-500" />
                      Ignored BOM Part Prefixes
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Parts starting with these prefixes are automatically excluded from the Pick List.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetDefaultPrefixes}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border flex items-center gap-1 transition ${
                        lightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                      title="Reset to permanent default ignored prefixes"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      Reset Defaults
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowExcludedPreview(!showExcludedPreview)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border flex items-center gap-1 transition ${
                        showExcludedPreview
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : lightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {showExcludedPreview ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Hide Ignored ({excludedBomParts.length})
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          View Ignored ({excludedBomParts.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Add Ignored Prefix Form */}
                <form onSubmit={handleAddIgnoredPrefix} className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={newPrefixInput}
                    onChange={(e) => setNewPrefixInput(e.target.value)}
                    placeholder="Add part prefix to ignore (e.g. Driver, 119-, IDS- or comma-separated)..."
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-amber-500 ${
                      lightMode
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!newPrefixInput.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow transition disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ignore Part / Prefix
                  </button>
                </form>

                {/* Active Ignored Prefix Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {ignoredPrefixes.map((prefix) => (
                    <span
                      key={prefix}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${
                        lightMode
                          ? 'bg-red-50 border-red-300 text-red-800'
                          : 'bg-red-500/15 border-red-500/30 text-red-300'
                      }`}
                    >
                      <span>{prefix}*</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIgnoredPrefix(prefix)}
                        className="hover:text-red-100 font-bold"
                        title={`Stop ignoring ${prefix}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Optional Collapsible Preview of Excluded BOM Rows */}
                {showExcludedPreview && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">
                      Excluded BOM Parts ({excludedBomParts.length} filtered out):
                    </div>
                    {excludedBomParts.length === 0 ? (
                      <div className="text-xs font-mono text-slate-500">
                        No BOM rows are currently excluded.
                      </div>
                    ) : (
                      <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                        {excludedBomParts.map((item) => (
                          <div
                            key={item.id}
                            className="px-2.5 py-1.5 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400"
                          >
                            <div className="truncate pr-2">
                              <span className="text-red-400 font-bold mr-2">
                                {item.partNumber}
                              </span>
                              <span>{item.description}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20 shrink-0">
                              Matched: {item.matchedIgnoreRule}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: SIMPLE PRINTABLE SECTION BREAKDOWN TICKET (WORKS WITH NO BOM)
           =================================================================== */}
        {activeTab === 'sectionTicket' && (
          <div className="max-w-5xl mx-auto">
            {/* Top Action Bar in Section Ticket Preview (Hidden when printing) */}
            <div className="no-print mb-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Simple Section Breakdown Ticket Ready (No BOM Required) — Shows each Line Name, Section Type (IND / BOR / MOR / EOR / COR###°), Exact Length, and Quantity.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                >
                  ← Back to Workspace
                </button>
                <button
                  onClick={triggerPrintSectionTicketNow}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Section Breakdown Ticket
                </button>
              </div>
            </div>

            <div
              ref={sectionTicketRef}
              className="print-container print-ticket-font bg-white text-slate-950 p-8 rounded-xl shadow-2xl border border-slate-300"
            >
              {/* Ticket Header Block */}
              <div className="border-b-2 border-slate-900 pb-4 mb-5">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex-1 min-w-[280px]">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      PICASSO BY AXIS LIGHTING USA
                    </div>
                    <h1 className="text-3xl font-extrabold uppercase tracking-tight mt-0.5">
                      PICASSO SUBMITTAL SECTION BREAKDOWN TICKET
                    </h1>
                    <div className="text-sm font-bold mt-1">
                      Project:{' '}
                      <span className="underline">{jobParams.projectName || 'UNSPECIFIED'}</span>
                    </div>
                  </div>

                  {/* Top-Right Side of Ticket: Smaller Logo + Single-Line Address & Single-Line Phone/Fax */}
                  <div className="shrink-0 ml-auto self-start flex flex-col items-end text-right bg-white">
                    <div className="bg-white inline-block">
                      <img
                        src={ticketLogoSrc}
                        onError={(e) => {
                          if (e.currentTarget.src !== ATTACHED_PICASSO_LOGO_FALLBACK) {
                            e.currentTarget.src = ATTACHED_PICASSO_LOGO_FALLBACK;
                          }
                        }}
                        alt="PICASSO BY AXIS LIGHTING USA"
                        className="block bg-white"
                        style={{
                          width: '150px',
                          height: 'auto',
                          objectFit: 'contain',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    </div>
                    <div className="text-[11px] leading-snug text-slate-800 mt-1 text-right font-semibold">
                      <div>320 West Commercial Ave, Moonachie, NJ 07074</div>
                      <div>Phone: +1 (201) 246-8188; Fax: +1 (201) 246-8122</div>
                    </div>
                  </div>
                </div>

                {/* Compact Metadata Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 border-2 border-slate-900 p-3 rounded-lg bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold">SALES ORDER #:</span>{' '}
                    <span className="text-sm font-black">
                      {jobParams.salesOrderNumber || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">SUBMITTAL DWG:</span>{' '}
                    {jobParams.submittalDrawingNumber || '—'}
                  </div>
                  <div>
                    <span className="font-bold">REVISION:</span> {jobParams.revision || '—'}
                  </div>
                  <div>
                    <span className="font-bold">CURRENT DAY:</span>{' '}
                    {jobParams.generatedDay || getFormattedCurrentDay()}
                  </div>
                  <div>
                    <span className="font-bold">DEADLINE:</span>{' '}
                    <span className="font-black underline">{jobParams.deadline || '—'}</span>
                  </div>
                  <div>
                    <span className="font-bold">ISSUED BY / RELEASED TO:</span>{' '}
                    {jobParams.issuedBy || '—'} / {jobParams.releasedTo || '—'}
                  </div>
                </div>
              </div>

              {/* Rollup Summary Bar */}
              <div className="mb-5 grid grid-cols-2 sm:grid-cols-6 gap-2 border border-slate-400 rounded-lg p-3 bg-slate-100 text-xs text-center font-bold">
                <div>
                  <div className="text-[10px] text-slate-600 uppercase">IND (Individual)</div>
                  <div className="text-base font-black">{sectionRollup.totalIND} PCS</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 uppercase">BOR (Beg. of Run)</div>
                  <div className="text-base font-black">{sectionRollup.totalBOR} PCS</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 uppercase">MOR (Mid. of Run)</div>
                  <div className="text-base font-black">{sectionRollup.totalMOR} PCS</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 uppercase">EOR (End of Run)</div>
                  <div className="text-base font-black">{sectionRollup.totalEOR} PCS</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 uppercase">COR###° (Corners)</div>
                  <div className="text-base font-black">{sectionRollup.totalCOR} PCS</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 uppercase">Total Sections</div>
                  <div className="text-base font-black">{sectionRollup.totalSections} PCS</div>
                </div>
              </div>

              {/* Per-Line Detailed Section Breakdown Table */}
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider mb-2">
                  Line-by-Line Section Breakdown (IND / BOR / MOR / EOR / COR###° with Exact Lengths &amp; Quantities)
                </div>
                <table className="w-full text-left border-collapse border-2 border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-2 px-2.5 border-r border-slate-700 w-10">#</th>
                      <th className="py-2 px-2.5 border-r border-slate-700">
                        Line Name / Submittal Catalog Specification
                      </th>
                      <th className="py-2 px-2 border-r border-slate-700 text-center">Type</th>
                      <th className="py-2 px-2 border-r border-slate-700 text-center">Pattern</th>
                      <th className="py-2 px-2 border-r border-slate-700 text-center">
                        Line Qty
                      </th>
                      <th className="py-2 px-2.5 border-r border-slate-700">
                        Section Role (IND / BOR / MOR / EOR / COR###°)
                      </th>
                      <th className="py-2 px-2.5 border-r border-slate-700 text-center">
                        Section Length
                      </th>
                      <th className="py-2 px-2.5 border-r border-slate-700 text-right">
                        Total Section Qty
                      </th>
                      <th className="py-2 px-2 text-center">Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionRollup.lineBreakdowns.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-slate-500">
                          No submittal lines entered yet. Add lines in the Workspace or analyze an SD Drawing.
                        </td>
                      </tr>
                    ) : (
                      sectionRollup.lineBreakdowns.map((line, lineIdx) =>
                        line.detailedSections.map((sec, secIdx) => (
                          <tr
                            key={`${line.id}-sec-${secIdx}`}
                            className={`border-b ${
                              secIdx === line.detailedSections.length - 1
                                ? 'border-b-2 border-slate-900'
                                : 'border-slate-300'
                            }`}
                          >
                            {secIdx === 0 && (
                              <>
                                <td
                                  rowSpan={line.detailedSections.length}
                                  className="py-2 px-2.5 border-r border-slate-400 font-bold align-top bg-slate-50"
                                >
                                  {lineIdx + 1}
                                </td>
                                <td
                                  rowSpan={line.detailedSections.length}
                                  className="py-2 px-2.5 border-r border-slate-400 font-bold align-top bg-slate-50"
                                >
                                  {line.catalogLine || 'UNSPECIFIED LINE'}
                                </td>
                                <td
                                  rowSpan={line.detailedSections.length}
                                  className="py-2 px-2 border-r border-slate-400 text-center font-semibold align-top bg-slate-50"
                                >
                                  {line.fixtureType}
                                </td>
                                <td
                                  rowSpan={line.detailedSections.length}
                                  className="py-2 px-2 border-r border-slate-400 text-center font-mono text-[11px] align-top bg-slate-50"
                                >
                                  {line.configMode === 'IND'
                                    ? 'IND (Solid)'
                                    : line.configMode === 'PATTERN'
                                    ? 'CLOSED PATTERN'
                                    : 'LINEAR RUN'}
                                </td>
                                <td
                                  rowSpan={line.detailedSections.length}
                                  className="py-2 px-2 border-r border-slate-400 text-center font-black text-sm align-top bg-slate-50"
                                >
                                  {line.qtyRequested}
                                </td>
                              </>
                            )}
                            <td className="py-1.5 px-2.5 border-r border-slate-300 font-bold">
                              {sec.role}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono font-bold">
                              {sec.length}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 text-right font-mono font-black text-sm">
                              {sec.totalQty} PCS
                            </td>
                            <td className="py-1.5 px-2 text-center">[ &nbsp;&nbsp;&nbsp; ]</td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Consolidated Section Length Totals Block */}
              <div className="mb-4 border border-slate-400 rounded-lg p-3 bg-slate-50">
                <div className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                  Consolidated Totals by Section Length &amp; Role
                </div>
                {sectionRollup.exactLengthSummary.length === 0 ? (
                  <div className="text-xs text-slate-600">—</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono font-bold">
                    {sectionRollup.exactLengthSummary.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded border border-slate-400 bg-white text-slate-900"
                      >
                        {item.formatted}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ticket Footer Footnote (8pt Font Size) */}
              {(jobParams.ticketFootnote ?? DEFAULT_TICKET_FOOTNOTE) && (
                <div
                  className="ticket-footnote-8pt mt-6 pt-3 border-t border-slate-400 text-slate-700"
                  style={{ fontSize: '8pt', lineHeight: 1.25 }}
                >
                  {jobParams.ticketFootnote ?? DEFAULT_TICKET_FOOTNOTE}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: PRINTABLE PICASSO WORK ORDER & PICKING/ALLOCATION TICKET
           =================================================================== */}
        {activeTab === 'print' && (
          <div className="max-w-5xl mx-auto">
            {/* Top Action Bar in Print Preview (Hidden when printing) */}
            <div className="no-print mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
                <Printer className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Picasso Work Order &amp; Picking/Allocation Ticket Preview Ready — Click &ldquo;Print Ticket Dialog&rdquo; or press{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                    Ctrl + P
                  </kbd>{' '}
                  to send to your printer or save as PDF.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                >
                  ← Back to Workspace
                </button>
                <button
                  onClick={triggerPrintNow}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Ticket Dialog
                </button>
              </div>
            </div>

            <div
              ref={printSheetRef}
              className="print-container print-ticket-font bg-white text-slate-950 p-8 rounded-xl shadow-2xl border border-slate-300"
            >
              {/* Ticket Header Block */}
              <div className="border-b-2 border-slate-900 pb-4 mb-5">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  {/* Left Side: Renamed Title + Project */}
                  <div className="flex-1 min-w-[280px]">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      PICASSO BY AXIS LIGHTING USA
                    </div>
                    <h1 className="text-3xl font-extrabold uppercase tracking-tight mt-0.5">
                      PICASSO WORK ORDER &amp; PICKING/ALLOCATION TICKET
                    </h1>
                    <div className="text-sm font-bold mt-1">
                      Project:{' '}
                      <span className="underline">{jobParams.projectName || 'UNSPECIFIED'}</span>
                    </div>
                  </div>

                  {/* Top-Right Side of Ticket: Smaller Logo + Single-Line Address & Single-Line Phone/Fax */}
                  <div className="shrink-0 ml-auto self-start flex flex-col items-end text-right bg-white">
                    <div className="bg-white inline-block">
                      <img
                        src={ticketLogoSrc}
                        onError={(e) => {
                          if (e.currentTarget.src !== ATTACHED_PICASSO_LOGO_FALLBACK) {
                            e.currentTarget.src = ATTACHED_PICASSO_LOGO_FALLBACK;
                          }
                        }}
                        alt="PICASSO BY AXIS LIGHTING USA"
                        className="block bg-white"
                        style={{
                          width: '150px',
                          height: 'auto',
                          objectFit: 'contain',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    </div>
                    <div className="text-[11px] leading-snug text-slate-800 mt-1 text-right font-semibold">
                      <div>320 West Commercial Ave, Moonachie, NJ 07074</div>
                      <div>Phone: +1 (201) 246-8188; Fax: +1 (201) 246-8122</div>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid in Ticket Header */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 border-2 border-slate-900 p-3 rounded-lg bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold">SALES ORDER #:</span>{' '}
                    <span className="text-sm font-black">
                      {jobParams.salesOrderNumber || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">SUBMITTAL DWG:</span>{' '}
                    {jobParams.submittalDrawingNumber || '—'}
                  </div>
                  <div>
                    <span className="font-bold">REVISION:</span> {jobParams.revision || '—'}
                  </div>
                  <div>
                    <span className="font-bold">BOM NUMBERS:</span> {jobParams.bomNumbers || '—'}
                  </div>
                  <div>
                    <span className="font-bold">CURRENT DAY:</span>{' '}
                    {jobParams.generatedDay || getFormattedCurrentDay()}
                  </div>
                  <div>
                    <span className="font-bold">DEADLINE:</span>{' '}
                    <span className="font-black underline">
                      {jobParams.deadline || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">ISSUED BY:</span>{' '}
                    {jobParams.issuedBy || '—'}
                  </div>
                  <div>
                    <span className="font-bold">RELEASED TO:</span>{' '}
                    {jobParams.releasedTo || '—'}
                  </div>
                  <div>
                    <span className="font-bold">DATE / TIME RELEASED TO FLOOR:</span>{' '}
                    {jobParams.dateTimeReleasedToFloor || '—'}
                  </div>
                </div>
              </div>

              {/* Submittal Notes Specification Summary Block */}
              <div className="mb-5 border border-slate-400 rounded-lg p-3 bg-slate-50">
                <div className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                  Submittal Summary (Based on Drawing Notes)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div>
                    <span className="font-bold">Finish:</span> {submittalSummary.finish || '—'}
                  </div>
                  <div>
                    <span className="font-bold">Mounting:</span> {submittalSummary.mounting || '—'}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-bold">LED Direct/Indirect:</span>{' '}
                    {submittalSummary.ledDirectIndirect || '—'}
                  </div>
                  <div>
                    <span className="font-bold">Canopy Color:</span>{' '}
                    {submittalSummary.canopyColor || '—'}
                  </div>
                  <div>
                    <span className="font-bold">Suspension Cable Length:</span>{' '}
                    {submittalSummary.suspensionCableLength || '—'}
                  </div>
                  <div>
                    <span className="font-bold">Power Cord Color &amp; Length:</span>{' '}
                    {submittalSummary.powerCordColorAndLength || '—'}
                  </div>
                  <div>
                    <span className="font-bold">Option:</span> {submittalSummary.option || '—'}
                  </div>
                </div>
              </div>

              {/* Breakdown by Section Length Block */}
              <div className="mb-5 border border-slate-400 rounded-lg p-3 bg-slate-50">
                <div className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                  Breakdown by Section Length
                </div>
                {sectionRollup.exactLengthSummary.length === 0 ? (
                  <div className="text-xs text-slate-600">—</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono font-bold">
                    {sectionRollup.exactLengthSummary.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded border border-slate-400 bg-white text-slate-900"
                      >
                        {item.formatted}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submittal Fixture & Run Lines Breakdown Table */}
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider mb-2">
                  Submittal Fixture &amp; Run Breakdown (IND: {sectionRollup.totalIND} | BOR:{' '}
                  {sectionRollup.totalBOR} | MOR: {sectionRollup.totalMOR} | EOR:{' '}
                  {sectionRollup.totalEOR} | COR###°: {sectionRollup.totalCOR})
                </div>
                <table className="w-full text-left border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-slate-200 border-b border-slate-400">
                      <th className="py-1.5 px-2 border-r border-slate-400">#</th>
                      <th className="py-1.5 px-2 border-r border-slate-400">
                        Submittal Catalog Line
                      </th>
                      <th className="py-1.5 px-2 border-r border-slate-400">Type</th>
                      <th className="py-1.5 px-2 border-r border-slate-400 text-center">
                        Qty Req.
                      </th>
                      <th className="py-1.5 px-2 text-right">Section Length Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionRollup.lineBreakdowns.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500">
                          No submittal lines entered.
                        </td>
                      </tr>
                    ) : (
                      sectionRollup.lineBreakdowns.map((line, i) => (
                        <tr key={line.id} className="border-b border-slate-300">
                          <td className="py-1.5 px-2 border-r border-slate-300">{i + 1}</td>
                          <td className="py-1.5 px-2 border-r border-slate-300 font-bold">
                            {line.catalogLine}
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-300">
                            {line.fixtureType}
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-300 text-center font-black">
                            {line.qtyRequested}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-semibold">
                            {line.formattedLengthTags.join(' ')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Allocated BOM Parts Table */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Multiplied BOM Part Pick &amp; Allocation List</span>
                  <span>Total Pieces to Gather: {grandTotalPieces.toLocaleString()}</span>
                </div>
                <table className="w-full text-left border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-2 px-2.5 border-r border-slate-700">Part Number</th>
                      <th className="py-2 px-2.5 border-r border-slate-700">Part Description</th>
                      <th className="py-2 px-2 border-r border-slate-700 text-center">IND</th>
                      <th className="py-2 px-2 border-r border-slate-700 text-center">BOR</th>
                      <th className="py-2 px-2 border-r border-slate-700 text-center">MOR</th>
                      <th className="py-2 px-2 border-r border-slate-700 text-center">EOR</th>
                      <th className="py-2 px-2.5 border-r border-slate-700 text-right">
                        Total Qty
                      </th>
                      <th className="py-2 px-2.5 text-center">Picked Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePickList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-500">
                          No BOM parts added yet.
                        </td>
                      </tr>
                    ) : (
                      activePickList.map((item) => (
                        <tr key={item.id} className="border-b border-slate-300">
                          <td className="py-2 px-2.5 border-r border-slate-300 font-bold">
                            {item.partNumber}
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300">
                            {item.description}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center">
                            {item.indTotal}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center">
                            {item.borTotal}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center">
                            {item.morTotal}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-center">
                            {item.eorTotal}
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-right font-black text-sm">
                            {item.totalJobQty.toLocaleString()}
                          </td>
                          <td className="py-2 px-2.5 text-center">[ &nbsp;&nbsp;&nbsp; ]</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Ticket Footer Footnote (8pt Font Size) */}
              {(jobParams.ticketFootnote ?? DEFAULT_TICKET_FOOTNOTE) && (
                <div
                  className="ticket-footnote-8pt mt-6 pt-3 border-t border-slate-400 text-slate-700"
                  style={{ fontSize: '8pt', lineHeight: 1.25 }}
                >
                  {jobParams.ticketFootnote ?? DEFAULT_TICKET_FOOTNOTE}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =====================================================================
          MODAL 1: ADD MANUAL PART ROW (DEFAULTS TO SCOPE: ALL SECTIONS)
         ===================================================================== */}
      {showAddPartModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
              lightMode ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}
          >
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              Add Custom BOM Part Row
            </h3>
            <form onSubmit={handleCreateManualPart} className="space-y-3 text-xs">
              <div>
                <label className="block font-mono uppercase text-slate-400 mb-1">
                  Part Number *
                </label>
                <input
                  type="text"
                  required
                  value={newPartForm.partNumber}
                  onChange={(e) =>
                    setNewPartForm({ ...newPartForm, partNumber: e.target.value })
                  }
                  placeholder="e.g. 102-001800"
                  className={`w-full px-3 py-2 rounded-lg font-mono border ${
                    lightMode
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-slate-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newPartForm.description}
                  onChange={(e) =>
                    setNewPartForm({ ...newPartForm, description: e.target.value })
                  }
                  placeholder="e.g. ALIGNMENT PIN BRACKET"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    lightMode
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-slate-400 mb-1">
                  Section Scope (Defaults to All Sections)
                </label>
                <select
                  value={newPartForm.lengthFilter}
                  onChange={(e) =>
                    setNewPartForm({ ...newPartForm, lengthFilter: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg font-mono border ${
                    lightMode
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="ALL">All Sections (IND / BOR / MOR / EOR)</option>
                  <option value="4'">4&apos;-0&quot; Sections Only</option>
                  <option value="8'">8&apos;-0&quot; Sections Only</option>
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-mono text-cyan-400 mb-1">IND Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartForm.indUnitQty}
                    onChange={(e) =>
                      setNewPartForm({ ...newPartForm, indUnitQty: Number(e.target.value) })
                    }
                    className={`w-full px-2 py-1.5 rounded font-mono border ${
                      lightMode
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-mono text-amber-400 mb-1">BOR Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartForm.borUnitQty}
                    onChange={(e) =>
                      setNewPartForm({ ...newPartForm, borUnitQty: Number(e.target.value) })
                    }
                    className={`w-full px-2 py-1.5 rounded font-mono border ${
                      lightMode
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-mono text-purple-400 mb-1">MOR Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartForm.morUnitQty}
                    onChange={(e) =>
                      setNewPartForm({ ...newPartForm, morUnitQty: Number(e.target.value) })
                    }
                    className={`w-full px-2 py-1.5 rounded font-mono border ${
                      lightMode
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-mono text-emerald-400 mb-1">EOR Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartForm.eorUnitQty}
                    onChange={(e) =>
                      setNewPartForm({ ...newPartForm, eorUnitQty: Number(e.target.value) })
                    }
                    className={`w-full px-2 py-1.5 rounded font-mono border ${
                      lightMode
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  Add Part to Pick List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: GEMINI API KEY FOR LOCAL EXECUTION
         ===================================================================== */}
      {showApiKeyModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
              lightMode ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}
          >
            <h3 className="text-base font-bold mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              Gemini API Key Settings
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              When running inside Gemini Canvas, the AI key is handled automatically. If you run
              this app locally on your desktop, paste your Gemini API key below.
            </p>
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => {
                setCustomApiKey(e.target.value);
                try {
                  localStorage.setItem(LOCAL_STORAGE_API_KEY, e.target.value);
                } catch (err) {
                  // Ignore storage errors
                }
              }}
              placeholder="AIzaSy..."
              className={`w-full px-3 py-2 rounded-lg text-xs font-mono border mb-4 ${
                lightMode
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-slate-950 border-slate-700 text-slate-100'
              }`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: DEPLOY TO VERCEL + NAMECHEAP (lumentatix.app) SETUP GUIDE
         ===================================================================== */}
      {showDeployModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 rounded-2xl border shadow-2xl ${
              lightMode ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                Live Domain &amp; Vercel Server Proxy Setup ({LIVE_DOMAIN})
              </h3>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold px-2"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 space-y-1">
                <div className="font-bold text-sky-300">How Live Updates Work:</div>
                <p>
                  1. Keep developing right here in Gemini. Whenever we update{' '}
                  <code className="font-mono text-amber-300">App.jsx</code>, paste it into{' '}
                  <code className="font-mono text-amber-300">src/App.jsx</code> in your GitHub repo.
                </p>
                <p>
                  2. Vercel automatically detects the GitHub commit and updates{' '}
                  <strong className="text-white">https://{LIVE_DOMAIN}</strong> in ~30 seconds.
                </p>
              </div>

              {/* Environment Variables */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono">
                <div className="text-[11px] uppercase text-amber-400 font-bold">
                  1. Vercel Environment Variables (Project Settings → Environment Variables)
                </div>
                <div>
                  <span className="text-emerald-400">GEMINI_API_KEY</span> = your Google AI Studio key (hidden on server)
                </div>
                <div>
                  <span className="text-emerald-400">APP_PASSWORD</span> = your Picasso staff passcode
                </div>
              </div>

              {/* api/auth.js */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-amber-400">
                    2. Create file: api/auth.js
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet('auth', VERCEL_API_AUTH_CODE)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono flex items-center gap-1"
                  >
                    {copiedSnippet === 'auth' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-400" />
                        Copy api/auth.js
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {VERCEL_API_AUTH_CODE}
                </pre>
              </div>

              {/* api/analyze.js */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-amber-400">
                    3. Create file: api/analyze.js
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet('analyze', VERCEL_API_ANALYZE_CODE)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono flex items-center gap-1"
                  >
                    {copiedSnippet === 'analyze' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-400" />
                        Copy api/analyze.js
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {VERCEL_API_ANALYZE_CODE}
                </pre>
              </div>

              {/* Namecheap DNS Records */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono">
                <div className="text-[11px] uppercase text-cyan-400 font-bold">
                  4. Namecheap Advanced DNS Records for {LIVE_DOMAIN}
                </div>
                <div>
                  • <strong>A Record</strong> | Host: <span className="text-amber-300">@</span> | Value:{' '}
                  <span className="text-emerald-300">76.76.21.21</span>
                </div>
                <div>
                  • <strong>CNAME Record</strong> | Host: <span className="text-amber-300">www</span> | Value:{' '}
                  <span className="text-emerald-300">cname.vercel-dns.com</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
