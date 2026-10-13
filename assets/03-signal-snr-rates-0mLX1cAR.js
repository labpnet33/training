var e={id:`signal-snr-rates`,h:{en:`Signal strength, SNR and data rates`,hi:`Signal strength, SNR aur data rates`},body:{en:`
<p>To design or troubleshoot RF you must read numbers in <b>dBm</b> and <b>dB</b>. They look strange (negative numbers, logarithms) but only four ideas are needed. This chapter teaches them step by step and then connects them to the data rate a client actually gets.</p>

<h3>dBm, dB and the rules of 3 and 10</h3>
<p><b>dBm</b> is power measured against 1 milliwatt on a logarithmic scale. 0 dBm is 1 mW; 20 dBm is 100 mW; 23 dBm is about 200 mW. A <b>dB</b> (no m) is a ratio, the difference between two powers. Two rules make mental maths easy:</p>
<ul>
<li><b>Rule of 3:</b> +3 dB means double the power, -3 dB means half the power.</li>
<li><b>Rule of 10:</b> +10 dB means ten times the power, -10 dB means one tenth.</li>
</ul>
<p>Signals received by a client are tiny, so they are negative dBm: -50 dBm is excellent, -67 dBm is a common design target for voice and video, -72 dBm is a typical minimum for data, and -85 dBm is almost unusable. The lab model uses -72 dBm as the level a client can reliably hear an AP and -82 dBm as the level at which an AP hears another AP.</p>

<h3>RSSI, noise floor and SNR</h3>
<p><b>RSSI</b> (received signal strength indicator) is the receiver's measure of signal power. Vendors scale it differently, but in practice you read it as dBm. The <b>noise floor</b> is the background radio noise, usually around -95 dBm in a quiet room; it rises with interference. <b>SNR</b> (signal to noise ratio) is the gap between them:</p>
<div class="eg"><p><b>Worked example.</b> A laptop reads RSSI -65 dBm and the noise floor is -95 dBm. SNR = -65 - (-95) = 30 dB, a healthy link. If a microwave oven raises the noise floor to -80 dBm, the same -65 dBm signal now gives SNR 15 dB: the signal did not change but the link got much worse. Always judge a link by SNR, not RSSI alone.</p></div>

<table class="cmp"><tr><th>SNR</th><th>Quality</th><th>Typical meaning</th></tr>
<tr><td>25 dB or more</td><td>Excellent</td><td>Highest rates, voice and video fine</td></tr>
<tr><td>15 to 25 dB</td><td>Good</td><td>Usable for data, may lose top rates</td></tr>
<tr><td>10 to 15 dB</td><td>Marginal</td><td>Low rates, retries, slow</td></tr>
<tr><td>Under 10 dB</td><td>Poor</td><td>Drops and disconnects</td></tr>
</table>

<h3>Path loss: why the signal fades with distance</h3>
<p>Signal strength falls as the wave spreads out (free-space path loss) and as it hits obstacles. Indoors, losses are bigger than outdoors. The lab model uses a simple formula: received power equals transmit power in dBm minus a fixed loss, minus 6 dB more for 5 GHz, minus 35 times the log of the distance. The two lessons are what matter: <b>5 GHz loses about 6 dB more than 2.4 GHz</b> at the same distance (so its cell is smaller), and <b>every 3 dB of power you remove costs a fixed fraction of range</b>. Real buildings add walls (about 3 to 6 dB each for drywall or glass, 10 to 15 dB for concrete) and people (a body can absorb several dB).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Signal falls with distance">
<line x1="50" y1="20" x2="50" y2="160" stroke="#64748b"/><line x1="50" y1="160" x2="610" y2="160" stroke="#64748b"/>
<text x="20" y="30" class="svg-muted" font-size="11">dBm</text><text x="560" y="180" class="svg-muted" font-size="11">distance</text>
<path d="M60 30 Q200 100 600 140" fill="none" stroke="#0369a1" stroke-width="2"/><text x="400" y="104" class="svg-ink" font-size="12">2.4 GHz</text>
<path d="M60 44 Q180 120 600 154" fill="none" stroke="#7c3aed" stroke-width="2"/><text x="330" y="146" class="svg-ink" font-size="12">5 GHz (about 6 dB lower)</text>
<line x1="50" y1="118" x2="610" y2="118" stroke="#dc2626" stroke-dasharray="5"/><text x="470" y="112" class="svg-accent" font-size="12">-72 dBm client floor</text>
</svg><p class="cap">Where a curve crosses the red line the cell ends. 5 GHz crosses earlier, so its cell is smaller.</p></div>

<h3>From SNR to data rate</h3>
<p>Wi-Fi is adaptive. The transmitter picks a <b>modulation and coding scheme (MCS)</b> that the current SNR can support: high SNR allows dense modulation such as 256-QAM or 1024-QAM and very high rates; low SNR forces BPSK or QPSK and low rates. As the client walks away, its rate steps down. Two consequences shape design:</p>
<ul>
<li><b>Slow clients consume more airtime.</b> A frame sent at 6 Mbps occupies the channel many times longer than the same frame at 300 Mbps. One far-away client can eat the capacity of ten close ones.</li>
<li><b>Management frames use the lowest basic rate.</b> Beacons and probe responses are sent at the lowest enabled mandatory rate (1 Mbps in 2.4 GHz with 802.11b rates enabled). Disabling the lowest rates (next chapters) makes beacons shorter and the cell tighter.</li>
</ul>
<p>Retries are the visible sign of weak SNR or interference: if many frames are sent twice or more, airtime is being wasted. A retry rate above 10 to 15 percent in a busy area deserves investigation.</p>

<h3>Link budget: the AP is not the only speaker</h3>
<p>A link works only if both directions work. An AP may transmit at 20 dBm, but a phone transmits at 10 to 15 dBm. The phone hears the AP (the AP is loud) but the AP cannot hear the phone, so the connection fails. This is why designers never set AP power to the maximum "to cover more": a client far away would see full bars and still fail. Match AP power to client power. Chapter 5 returns to this.</p>

<pre class="code"><span class="c">! Lab client detail on the controller shows what the radio sees</span>
WLC1# show wireless client mac-address 0050.7966.6801 detail</pre>
<pre class="out">Client MAC Address : 0050.7966.6801
Client IPv4 Address: 10.10.20.11
AP Name            : AP1
WLAN Profile Name  : NK-STAFF
VLAN               : 20
Radio / Channel    : 2.4 GHz / 1
RSSI               : <span class="hl">-58 dBm</span>
Authentication     : PSK
Client State       : Run</pre>

<div class="warn"><p><b>Common mistakes.</b> Reading RSSI as a percentage (it is not), ignoring noise floor, and testing signal only at the AP's own height. Measure where the client will be, at the client's height, with the client's own radio.</p></div>
<div class="exam"><p><b>Exam trap.</b> -70 dBm is a stronger signal than -80 dBm. A smaller negative number is better. And +3 dB doubles power, it does not add 3 mW.</p></div>

<div class="scn"><h4>Full bars, slow voice</h4><p>A hospital reports choppy voice calls although handsets show -60 dBm. A spectrum check shows the noise floor at -78 dBm because of a nearby wireless camera link. SNR is only 18 dB with retries at 25 percent. Moving voice to 5 GHz and replacing the camera link fixed it.</p><p><b>Lesson:</b> RSSI looked fine; SNR and retries told the truth.</p></div>

<div class="iv"><p class="q">"A client shows -60 dBm but is slow. What do you check?"</p><p>SNR and the noise floor, the data rate and retry percentage, channel utilisation and the number of clients on the AP. A good answer separates signal (coverage) from airtime (capacity) and mentions measuring at the client.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>+3 dB doubles power, +10 dB is ten times.</li>
<li>SNR = signal minus noise floor; judge a link by SNR, not RSSI alone.</li>
<li>5 GHz loses about 6 dB more than 2.4 GHz, so cells are smaller.</li>
<li>Low SNR means low data rates, and slow frames waste airtime for everyone.</li>
<li>A link needs both directions: do not set AP power far above client power.</li>
</ul></div>
`,hi:`
<p>RF design ya troubleshoot karne ke liye aapko <b>dBm</b> aur <b>dB</b> mein numbers padhna aana chahiye. Yeh ajeeb dikhte hain (negative numbers, logarithm) lekin sirf chaar ideas chahiye. Yeh chapter unhe step by step sikhata hai aur phir unhe us data rate se jodta hai jo client ko asal mein milta hai.</p>

<h3>dBm, dB aur rule of 3 aur 10</h3>
<p><b>dBm</b> power hai jo 1 milliwatt ke against logarithmic scale par naapi jaati hai. 0 dBm matlab 1 mW; 20 dBm matlab 100 mW; 23 dBm lagbhag 200 mW. <b>dB</b> (bina m ke) ek ratio hai, do powers ka farak. Do rules mental maths aasan bana dete hain:</p>
<ul>
<li><b>Rule of 3:</b> +3 dB matlab power double, -3 dB matlab power aadhi.</li>
<li><b>Rule of 10:</b> +10 dB matlab power das guna, -10 dB matlab dasva hissa.</li>
</ul>
<p>Client ko jo signals milte hain woh bahut chhote hote hain, isliye negative dBm hote hain: -50 dBm excellent hai, -67 dBm voice aur video ke liye common design target hai, -72 dBm data ke liye typical minimum hai, aur -85 dBm lagbhag unusable hai. Lab model -72 dBm ko woh level maanta hai jahan client AP ko reliably sun sakta hai, aur -82 dBm woh level jahan AP doosre AP ko sunta hai.</p>

<h3>RSSI, noise floor aur SNR</h3>
<p><b>RSSI</b> (received signal strength indicator) receiver ka signal power ka measure hai. Vendors ise alag scale karte hain, lekin practice mein aap ise dBm ki tarah padhte ho. <b>Noise floor</b> background radio noise hai, quiet room mein aam taur par -95 dBm ke aaspaas; interference se yeh badhta hai. <b>SNR</b> (signal to noise ratio) dono ke beech ka gap hai:</p>
<div class="eg"><p><b>Worked example.</b> Ek laptop ka RSSI -65 dBm hai aur noise floor -95 dBm. SNR = -65 - (-95) = 30 dB, healthy link. Agar microwave oven noise floor ko -80 dBm kar de, to wahi -65 dBm signal ab SNR 15 dB deta hai: signal nahi badla lekin link bahut kharab ho gaya. Link ko hamesha SNR se judge karo, sirf RSSI se nahi.</p></div>

<table class="cmp"><tr><th>SNR</th><th>Quality</th><th>Typical matlab</th></tr>
<tr><td>25 dB ya zyada</td><td>Excellent</td><td>Highest rates, voice aur video theek</td></tr>
<tr><td>15 se 25 dB</td><td>Good</td><td>Data ke liye usable, top rates mil nahi sakte</td></tr>
<tr><td>10 se 15 dB</td><td>Marginal</td><td>Low rates, retries, slow</td></tr>
<tr><td>10 dB se kam</td><td>Poor</td><td>Drops aur disconnects</td></tr>
</table>

<h3>Path loss: distance ke saath signal kyun girta hai</h3>
<p>Signal ki strength tab girti hai jab wave failti hai (free-space path loss) aur jab obstacles se takrati hai. Indoors loss outdoors se zyada hota hai. Lab model ek simple formula use karta hai: received power barabar transmit power dBm mein minus ek fixed loss, 5 GHz ke liye 6 dB aur minus, aur phir minus 35 guna distance ka log. Do lessons zaroori hain: <b>5 GHz same distance par lagbhag 6 dB zyada loss karta hai 2.4 GHz se</b> (isliye uski cell chhoti hoti hai), aur <b>har 3 dB power jo aap hatate ho woh range ka ek fixed hissa leta hai</b>. Real buildings mein walls (drywall ya glass ke liye lagbhag 3 se 6 dB, concrete ke liye 10 se 15 dB) aur log (ek body kai dB absorb kar sakti hai) jud jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Signal distance ke saath girta hai">
<line x1="50" y1="20" x2="50" y2="160" stroke="#64748b"/><line x1="50" y1="160" x2="610" y2="160" stroke="#64748b"/>
<text x="20" y="30" class="svg-muted" font-size="11">dBm</text><text x="560" y="180" class="svg-muted" font-size="11">distance</text>
<path d="M60 30 Q200 100 600 140" fill="none" stroke="#0369a1" stroke-width="2"/><text x="400" y="104" class="svg-ink" font-size="12">2.4 GHz</text>
<path d="M60 44 Q180 120 600 154" fill="none" stroke="#7c3aed" stroke-width="2"/><text x="330" y="146" class="svg-ink" font-size="12">5 GHz (lagbhag 6 dB kam)</text>
<line x1="50" y1="118" x2="610" y2="118" stroke="#dc2626" stroke-dasharray="5"/><text x="470" y="112" class="svg-accent" font-size="12">-72 dBm client floor</text>
</svg><p class="cap">Jahan curve laal line ko cross karta hai wahan cell khatam. 5 GHz pehle cross karta hai, isliye uski cell chhoti hai.</p></div>

<h3>SNR se data rate tak</h3>
<p>Wi-Fi adaptive hai. Transmitter ek <b>modulation and coding scheme (MCS)</b> chunta hai jo current SNR support kar sake: high SNR par dense modulation jaise 256-QAM ya 1024-QAM aur bahut high rates; low SNR par BPSK ya QPSK aur low rates. Jaise client door jaata hai, uska rate step by step girta hai. Do nateeje design ko shape karte hain:</p>
<ul>
<li><b>Slow clients zyada airtime khate hain.</b> 6 Mbps par bheja frame channel ko 300 Mbps wale frame se kai guna zyada der occupy karta hai. Ek door wala client das paas wale clients ki capacity kha sakta hai.</li>
<li><b>Management frames lowest basic rate use karte hain.</b> Beacons aur probe responses lowest enabled mandatory rate par bhejte hain (802.11b rates enabled hon to 2.4 GHz mein 1 Mbps). Lowest rates disable karne se (aage ke chapters) beacons chhote hote hain aur cell tight hoti hai.</li>
</ul>
<p>Retries weak SNR ya interference ka dikhne wala sign hain: agar bahut frames do ya zyada baar bheje jaate hain to airtime waste ho raha hai. Busy area mein 10 se 15 percent se upar retry rate investigation maangta hai.</p>

<h3>Link budget: AP akela speaker nahi hai</h3>
<p>Link tabhi chalta hai jab dono directions chalein. AP 20 dBm par transmit kar sakta hai, lekin phone 10 se 15 dBm par karta hai. Phone AP ko sunta hai (AP loud hai) lekin AP phone ko nahi sun paata, to connection fail hota hai. Isiliye designers "zyada cover karne ke liye" AP power ko maximum par kabhi set nahi karte: door ka client full bars dekhega aur phir bhi fail hoga. AP power ko client power se match karo. Chapter 5 mein dobara aayenge.</p>

<pre class="code"><span class="c">! Lab client detail controller par woh dikhata hai jo radio dekhta hai</span>
WLC1# show wireless client mac-address 0050.7966.6801 detail</pre>
<pre class="out">Client MAC Address : 0050.7966.6801
Client IPv4 Address: 10.10.20.11
AP Name            : AP1
WLAN Profile Name  : NK-STAFF
VLAN               : 20
Radio / Channel    : 2.4 GHz / 1
RSSI               : <span class="hl">-58 dBm</span>
Authentication     : PSK
Client State       : Run</pre>

<div class="warn"><p><b>Common galtiyan.</b> RSSI ko percentage padhna (woh nahi hai), noise floor ignore karna, aur signal sirf AP ki apni height par test karna. Wahan naapo jahan client hoga, client ki height par, client ke apne radio se.</p></div>
<div class="exam"><p><b>Exam trap.</b> -70 dBm -80 dBm se strong signal hai. Chhota negative number behtar hai. Aur +3 dB power ko double karta hai, 3 mW add nahi karta.</p></div>

<div class="scn"><h4>Full bars, choppy voice</h4><p>Ek hospital mein voice calls choppy hain jabki handsets -60 dBm dikhate hain. Spectrum check mein noise floor -78 dBm nikla kyunki paas mein ek wireless camera link hai. SNR sirf 18 dB hai aur retries 25 percent. Voice ko 5 GHz par le jaane aur camera link badalne se theek hua.</p><p><b>Seekh:</b> RSSI theek lag raha tha; SNR aur retries ne sach bataya.</p></div>

<div class="iv"><p class="q">"Client -60 dBm dikhata hai lekin slow hai. Aap kya check karoge?"</p><p>SNR aur noise floor, data rate aur retry percentage, channel utilisation aur AP par clients ki sankhya. Achha jawab signal (coverage) ko airtime (capacity) se alag karta hai aur client par measure karne ka zikr karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>+3 dB power double karta hai, +10 dB das guna.</li>
<li>SNR = signal minus noise floor; link ko SNR se judge karo, sirf RSSI se nahi.</li>
<li>5 GHz 2.4 GHz se lagbhag 6 dB zyada loss karta hai, isliye cells chhoti hoti hain.</li>
<li>Low SNR matlab low data rates, aur slow frames sab ka airtime waste karte hain.</li>
<li>Link ko dono directions chahiye: AP power ko client power se bahut upar mat rakho.</li>
</ul></div>
`}};export{e as default};