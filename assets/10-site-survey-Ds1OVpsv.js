var e={id:`site-survey`,h:{en:`Site surveys and channel planning`,hi:`Site surveys aur channel planning`},body:{en:`
<p>Imagine arranging loudspeakers in a big wedding hall with three parallel events. Each event needs its speakers loud enough for its own guests, but not so loud that the next group hears them, and two neighbouring groups must not play on the same speaker system or everyone hears a mess. You would walk the hall first, note the pillars and curtains, and test before the guests arrive. That is a <b>site survey</b> and <b>channel planning</b>: measure the building, place the APs, give neighbours different channels, and size each cell with transmit power.</p>

<h3>Start with requirements</h3>
<ul>
<li><b>Coverage</b>: the minimum signal and SNR everywhere users work. A common design target is −67 dBm with at least 25 dB SNR for voice and video, and about −70 dBm for general data.</li>
<li><b>Capacity</b>: how many devices, which applications, how much throughput. A common planning figure is 25 to 50 active devices per radio, fewer for heavy video.</li>
<li><b>Roaming</b>: enough cell overlap (15 to 20 %) at the design level for devices that move.</li>
<li><b>Clients</b>: which bands and standards they support; the weakest client (a scanner, a phone) sets the design, not the best laptop.</li>
</ul>

<h3>Types of site survey</h3>
<dl class="terms">
<dt>Predictive survey</dt><dd>Software models the floor plan, wall materials and AP positions and predicts coverage. Fast and cheap, but only as good as the wall data you enter.</dd>
<dt>Pre-deployment (AP-on-a-stick)</dt><dd>A temporary AP is placed at candidate positions while an engineer walks the area measuring signal. Best for difficult buildings such as hospitals and warehouses.</dd>
<dt>Passive survey</dt><dd>The survey tool only listens to beacons, recording signal, noise and channel of every AP. Used to validate coverage after installation.</dd>
<dt>Active survey</dt><dd>The tool associates to the network and measures throughput, retries, packet loss and roaming.</dd>
<dt>Spectrum analysis</dt><dd>Measures raw RF energy to find non-Wi-Fi interferers (microwave ovens, cameras, radar).</dd>
</dl>
<p>Good projects combine them: predictive for the plan, AP-on-a-stick for hard areas, then a post-deployment passive and active validation survey under real conditions.</p>

<h3>Channel planning: the honeycomb</h3>
<p>Picture each cell as a hexagon. On 2.4 GHz, colour them with channels 1, 6 and 11 so that <b>no two neighbouring cells share a channel</b>, including the floors above and below. On 5 GHz you have many more channels, so neighbours are easy to separate and channels are reused only in cells far apart.</p>

<div class="dia"><svg viewBox="0 0 640 225" role="img" aria-label="Honeycomb channel plan">
<circle cx="80" cy="70" r="50" fill="#bae6fd" fill-opacity="0.8" stroke="#0284c7"/><text x="80" y="75" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<circle cx="170" cy="70" r="50" fill="#bbf7d0" fill-opacity="0.8" stroke="#16a34a"/><text x="170" y="75" text-anchor="middle" class="svg-ink" font-size="14">6</text>
<circle cx="260" cy="70" r="50" fill="#fde68a" fill-opacity="0.8" stroke="#d97706"/><text x="260" y="75" text-anchor="middle" class="svg-ink" font-size="14">11</text>
<circle cx="350" cy="70" r="50" fill="#bae6fd" fill-opacity="0.8" stroke="#0284c7"/><text x="350" y="75" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<circle cx="440" cy="70" r="50" fill="#bbf7d0" fill-opacity="0.8" stroke="#16a34a"/><text x="440" y="75" text-anchor="middle" class="svg-ink" font-size="14">6</text>
<circle cx="125" cy="150" r="50" fill="#fde68a" fill-opacity="0.8" stroke="#d97706"/><text x="125" y="155" text-anchor="middle" class="svg-ink" font-size="14">11</text>
<circle cx="215" cy="150" r="50" fill="#bae6fd" fill-opacity="0.8" stroke="#0284c7"/><text x="215" y="155" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<circle cx="305" cy="150" r="50" fill="#bbf7d0" fill-opacity="0.8" stroke="#16a34a"/><text x="305" y="155" text-anchor="middle" class="svg-ink" font-size="14">6</text>
<circle cx="395" cy="150" r="50" fill="#fde68a" fill-opacity="0.8" stroke="#d97706"/><text x="395" y="155" text-anchor="middle" class="svg-ink" font-size="14">11</text>
<circle cx="485" cy="150" r="50" fill="#bae6fd" fill-opacity="0.8" stroke="#0284c7"/><text x="485" y="155" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="12">2.4 GHz</text>
<text x="580" y="80" text-anchor="middle" class="svg-muted" font-size="12">no touching</text>
<text x="580" y="96" text-anchor="middle" class="svg-muted" font-size="12">cells share</text>
<text x="580" y="112" text-anchor="middle" class="svg-muted" font-size="12">a channel</text>
<text x="320" y="218" text-anchor="middle" class="svg-accent" font-size="12">small overlaps allow roaming; same channel only far apart</text>
</svg><p class="cap">A 1-6-11 reuse pattern: every cell's neighbours are on the other two channels.</p></div>

<h3>Transmit power sizes the cell</h3>
<p>More power is not better. Big cells hear more same-channel neighbours (co-channel contention), clients stick to a far AP instead of roaming, and the link becomes <b>asymmetric</b>: the AP at 20 dBm reaches a phone that transmits at only about 14 dBm, but the AP cannot hear the phone's replies well. Designers lower AP power so cells are small and channels can be reused. In dense 5 GHz designs, some 2.4 GHz radios are switched off or put in monitor mode, because three channels cannot separate many overlapping 2.4 GHz cells.</p>
<p>Cisco controllers can automate this with <b>RRM</b> (radio resource management): <b>DCA</b> (dynamic channel assignment), <b>TPC</b> (transmit power control) and <b>coverage hole detection</b>, which raises power when clients report weak signal. In the lab you assign channels by hand to see what RRM does for you.</p>

<h3>Lab walkthrough: planning the training hall</h3>
<p>Three APs joined WLC1 with factory defaults. First, read the plan:</p>
<pre class="out">(WLC1) &gt;show advanced 802.11b channel

802.11b/g/n (2.4 GHz) channel plan   (non-overlapping 20 MHz channels: 1, 6, 11)
Network status................................... Enabled

AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
-------------  -------  --------  -----------  --------  ----------------------
AP1            1        2412      1 (20 dBm)   Up        AP2(1) AP3(1)
AP2            1        2412      1 (20 dBm)   Up        AP1(1) AP3(1)
AP3            1        2412      1 (20 dBm)   Up        AP1(1) AP2(1)

<span class="hl">Interference: 3 AP pair(s) on overlapping channels</span>
  AP1 &lt;-&gt; AP2     ch 1/1     -58 dBm   21 m   co-channel
  AP1 &lt;-&gt; AP3     ch 1/1     -71 dBm   42 m   co-channel
  AP2 &lt;-&gt; AP3     ch 1/1     -58 dBm   21 m   co-channel</pre>
<p>Three APs that all hear each other form three pairs. Assign 1, 6 and 11, give the 5 GHz radios 36, 40 and 44 (chapter 5), and shrink AP2's 2.4 GHz cell in the middle of the hall:</p>
<pre class="code"><span class="c">! 2.4 GHz: the three non-overlapping channels</span>
(WLC1) &gt;config 802.11b channel ap AP1 1
(WLC1) &gt;config 802.11b channel ap AP2 6
(WLC1) &gt;config 802.11b channel ap AP3 11
<span class="c">! 5 GHz: different 20 MHz channels for neighbours</span>
(WLC1) &gt;config 802.11a channel ap AP2 40
(WLC1) &gt;config 802.11a channel ap AP3 44
<span class="c">! power level 3 = 20 - 6 = 14 dBm</span>
(WLC1) &gt;config 802.11b txPower ap AP2 3
(WLC1) &gt;show advanced 802.11b channel</pre>
<pre class="out">AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
-------------  -------  --------  -----------  --------  ----------------------
AP1            1        2412      1 (20 dBm)   Up        -
AP2            6        2437      3 (14 dBm)   Up        -
AP3            11       2462      1 (20 dBm)   Up        -

<span class="hl">Interference: none - no neighbouring APs share or overlap a channel</span></pre>
<p>Finally, <code>show ap config 802.11b AP3</code> confirms the channel maths: <code>Current Channel ... 11 (2462 MHz)</code>, because 2407 + 5 × 11 = 2462.</p>

<div class="eg"><p><b>Worked example.</b> The hall will hold 120 students with two devices each: 240 devices. Using 50 active devices per radio, 5 GHz needs about 240 / 50 ≈ 5 radios, so 5 APs on five different 5 GHz channels such as 36, 40, 44, 48 and 149. On 2.4 GHz only three channels exist, so five APs cannot all have their own; the designer enables 2.4 GHz on three of them (1, 6, 11) at reduced power and turns the other two 2.4 GHz radios off or to monitor.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting every AP to maximum power "for better coverage". It creates large overlapping cells, co-channel contention, asymmetric links and sticky clients. Design for the client's power and the capacity target, not for the biggest possible cell. Also avoid "almost right" plans like 1, 3 and 6: overlapping channels cause adjacent-channel interference, which is worse than sharing a channel.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the survey types (predictive, AP-on-a-stick, passive, active, spectrum) and RRM's parts: DCA for channels, TPC for power, coverage hole detection. The 2.4 GHz reuse pattern is 1, 6, 11 with no neighbouring cells on the same channel.</p></div>

<div class="scn"><h4>The predictive plan that forgot the cabinets</h4><p>A predictive survey for a finance floor showed perfect −65 dBm coverage. After go-live, users near the records room complained of drop-outs. A passive validation survey showed −80 dBm there: two rows of full-height metal filing cabinets, not in the floor plan, were reflecting and blocking the signal. One extra AP inside the records area and a channel re-plan around it solved the problem.</p><p><b>Lesson:</b> predictive surveys depend on accurate wall and obstacle data; always validate after deployment.</p></div>

<div class="iv"><p class="q">"How would you plan Wi-Fi channels for a new three-floor office?"</p><p>Strong answer: start from requirements (coverage level such as −67 dBm, device counts, applications, client capabilities), do a predictive survey and validate hard areas on site. Use 5 GHz as the main band with 20 or 40 MHz channels so there are enough to separate neighbours, including the floors above and below. On 2.4 GHz use only 1, 6 and 11 in a honeycomb, at lower power, turning off some radios if cells overlap too much. Set power so cells overlap 15 to 20 % for roaming, let RRM (DCA and TPC) fine-tune, and finish with a post-deployment validation survey.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design from requirements: coverage (−67 dBm, SNR ≥ 25 dB for voice), capacity, roaming and the weakest client.</li>
<li>Survey types: predictive, AP-on-a-stick, passive, active and spectrum analysis; always validate after deployment.</li>
<li>Honeycomb reuse: neighbours never share a channel; 2.4 GHz uses only 1, 6 and 11.</li>
<li>Lower power makes smaller cells and more reuse; maximum power causes contention and sticky clients.</li>
<li>RRM automates channels (DCA), power (TPC) and coverage holes.</li>
</ul></div>
`,hi:`
<p>Ek bade wedding hall mein loudspeakers lagana socho jahan teen parallel events chal rahe hain. Har event ko apne speakers itne tez chahiye ki uske guests sun sakein, par itne tez nahi ki agla group sune, aur do padosi groups ek hi speaker system par nahi bajne chahiye warna sab khichdi sunte hain. Aap pehle hall mein ghoomoge, pillars aur parde note karoge, aur guests aane se pehle test karoge. Yahi <b>site survey</b> aur <b>channel planning</b> hai: building naapo, APs lagao, padosiyon ko alag channels do, aur transmit power se har cell ka size tay karo.</p>

<h3>Requirements se shuru karo</h3>
<ul>
<li><b>Coverage</b>: jahan bhi users kaam karte hain wahan minimum signal aur SNR. Voice aur video ke liye common design target −67 dBm aur kam se kam 25 dB SNR hai, aur general data ke liye lagbhag −70 dBm.</li>
<li><b>Capacity</b>: kitne devices, kaunsi applications, kitna throughput. Common planning figure har radio par 25 se 50 active devices hai, heavy video ke liye kam.</li>
<li><b>Roaming</b>: chalne wale devices ke liye design level par kaafi cell overlap (15 se 20 %).</li>
<li><b>Clients</b>: woh kaunse bands aur standards support karte hain; sabse kamzor client (scanner, phone) design tay karta hai, sabse achha laptop nahi.</li>
</ul>

<h3>Site survey ke types</h3>
<dl class="terms">
<dt>Predictive survey</dt><dd>Software floor plan, deewaron ke materials aur AP positions model karke coverage predict karta hai. Tez aur sasta, par utna hi achha jitna deewar ka data aap daalte ho.</dd>
<dt>Pre-deployment (AP-on-a-stick)</dt><dd>Ek temporary AP candidate positions par rakha jaata hai jabki engineer area mein chal kar signal naapta hai. Hospitals aur warehouses jaisi mushkil buildings ke liye best.</dd>
<dt>Passive survey</dt><dd>Survey tool sirf beacons sunta hai, har AP ka signal, noise aur channel record karta hai. Installation ke baad coverage validate karne ke liye use hota hai.</dd>
<dt>Active survey</dt><dd>Tool network se associate karke throughput, retries, packet loss aur roaming naapta hai.</dd>
<dt>Spectrum analysis</dt><dd>Raw RF energy naapta hai taaki non-Wi-Fi interferers (microwave ovens, cameras, radar) mil sakein.</dd>
</dl>
<p>Achhe projects inhe milate hain: plan ke liye predictive, mushkil areas ke liye AP-on-a-stick, phir real conditions mein post-deployment passive aur active validation survey.</p>

<h3>Channel planning: honeycomb</h3>
<p>Har cell ko ek hexagon socho. 2.4 GHz par unhe channels 1, 6 aur 11 se aise rango ki <b>koi do padosi cells ek channel share na karein</b>, upar aur neeche ke floors samet. 5 GHz par aapke paas kahin zyada channels hain, isliye padosiyon ko alag karna aasaan hai aur channels sirf door ke cells mein reuse hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 225" role="img" aria-label="Honeycomb channel plan">
<circle cx="80" cy="70" r="50" fill="#bae6fd" fill-opacity="0.8" stroke="#0284c7"/><text x="80" y="75" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<circle cx="170" cy="70" r="50" fill="#bbf7d0" fill-opacity="0.8" stroke="#16a34a"/><text x="170" y="75" text-anchor="middle" class="svg-ink" font-size="14">6</text>
<circle cx="260" cy="70" r="50" fill="#fde68a" fill-opacity="0.8" stroke="#d97706"/><text x="260" y="75" text-anchor="middle" class="svg-ink" font-size="14">11</text>
<circle cx="350" cy="70" r="50" fill="#bae6fd" fill-opacity="0.8" stroke="#0284c7"/><text x="350" y="75" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<circle cx="440" cy="70" r="50" fill="#bbf7d0" fill-opacity="0.8" stroke="#16a34a"/><text x="440" y="75" text-anchor="middle" class="svg-ink" font-size="14">6</text>
<circle cx="125" cy="150" r="50" fill="#fde68a" fill-opacity="0.8" stroke="#d97706"/><text x="125" y="155" text-anchor="middle" class="svg-ink" font-size="14">11</text>
<circle cx="215" cy="150" r="50" fill="#bae6fd" fill-opacity="0.8" stroke="#0284c7"/><text x="215" y="155" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<circle cx="305" cy="150" r="50" fill="#bbf7d0" fill-opacity="0.8" stroke="#16a34a"/><text x="305" y="155" text-anchor="middle" class="svg-ink" font-size="14">6</text>
<circle cx="395" cy="150" r="50" fill="#fde68a" fill-opacity="0.8" stroke="#d97706"/><text x="395" y="155" text-anchor="middle" class="svg-ink" font-size="14">11</text>
<circle cx="485" cy="150" r="50" fill="#bae6fd" fill-opacity="0.8" stroke="#0284c7"/><text x="485" y="155" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="12">2.4 GHz</text>
<text x="580" y="80" text-anchor="middle" class="svg-muted" font-size="12">chhoote hue</text>
<text x="580" y="96" text-anchor="middle" class="svg-muted" font-size="12">cells ek channel</text>
<text x="580" y="112" text-anchor="middle" class="svg-muted" font-size="12">share nahi karte</text>
<text x="320" y="218" text-anchor="middle" class="svg-accent" font-size="12">chhote overlaps se roaming; same channel sirf door door</text>
</svg><p class="cap">1-6-11 reuse pattern: har cell ke padosi baaki do channels par hain.</p></div>

<h3>Transmit power cell ka size tay karta hai</h3>
<p>Zyada power behtar nahi hai. Bade cells zyada same-channel padosi sunte hain (co-channel contention), clients roam karne ke bajaye door ke AP se chipke rehte hain, aur link <b>asymmetric</b> ho jaata hai: 20 dBm wala AP ek phone tak pahunchta hai jo sirf lagbhag 14 dBm transmit karta hai, par AP phone ke jawab theek se nahi sun paata. Designers AP power kam karte hain taaki cells chhote hon aur channels reuse ho sakein. Dense 5 GHz designs mein kuch 2.4 GHz radios band ya monitor mode mein kar diye jaate hain, kyunki teen channels bahut saare overlapping 2.4 GHz cells ko alag nahi kar sakte.</p>
<p>Cisco controllers ise <b>RRM</b> (radio resource management) se automate kar sakte hain: <b>DCA</b> (dynamic channel assignment), <b>TPC</b> (transmit power control) aur <b>coverage hole detection</b>, jo clients ke kamzor signal report karne par power badhata hai. Lab mein aap channels haath se assign karte ho taaki dekh sako RRM aapke liye kya karta hai.</p>

<h3>Lab walkthrough: training hall ki planning</h3>
<p>Teen APs factory defaults ke saath WLC1 se jude. Pehle plan padho:</p>
<pre class="out">(WLC1) &gt;show advanced 802.11b channel

802.11b/g/n (2.4 GHz) channel plan   (non-overlapping 20 MHz channels: 1, 6, 11)
Network status................................... Enabled

AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
-------------  -------  --------  -----------  --------  ----------------------
AP1            1        2412      1 (20 dBm)   Up        AP2(1) AP3(1)
AP2            1        2412      1 (20 dBm)   Up        AP1(1) AP3(1)
AP3            1        2412      1 (20 dBm)   Up        AP1(1) AP2(1)

<span class="hl">Interference: 3 AP pair(s) on overlapping channels</span>
  AP1 &lt;-&gt; AP2     ch 1/1     -58 dBm   21 m   co-channel
  AP1 &lt;-&gt; AP3     ch 1/1     -71 dBm   42 m   co-channel
  AP2 &lt;-&gt; AP3     ch 1/1     -58 dBm   21 m   co-channel</pre>
<p>Teen APs jo sab ek doosre ko sunte hain teen pairs banate hain. 1, 6 aur 11 assign karo, 5 GHz radios ko 36, 40 aur 44 do (chapter 5), aur hall ke beech mein AP2 ka 2.4 GHz cell chhota karo:</p>
<pre class="code"><span class="c">! 2.4 GHz: teen non-overlapping channels</span>
(WLC1) &gt;config 802.11b channel ap AP1 1
(WLC1) &gt;config 802.11b channel ap AP2 6
(WLC1) &gt;config 802.11b channel ap AP3 11
<span class="c">! 5 GHz: padosiyon ke liye alag 20 MHz channels</span>
(WLC1) &gt;config 802.11a channel ap AP2 40
(WLC1) &gt;config 802.11a channel ap AP3 44
<span class="c">! power level 3 = 20 - 6 = 14 dBm</span>
(WLC1) &gt;config 802.11b txPower ap AP2 3
(WLC1) &gt;show advanced 802.11b channel</pre>
<pre class="out">AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
-------------  -------  --------  -----------  --------  ----------------------
AP1            1        2412      1 (20 dBm)   Up        -
AP2            6        2437      3 (14 dBm)   Up        -
AP3            11       2462      1 (20 dBm)   Up        -

<span class="hl">Interference: none - no neighbouring APs share or overlap a channel</span></pre>
<p>Aakhir mein <code>show ap config 802.11b AP3</code> channel maths confirm karta hai: <code>Current Channel ... 11 (2462 MHz)</code>, kyunki 2407 + 5 × 11 = 2462.</p>

<div class="eg"><p><b>Worked example.</b> Hall mein 120 students honge, har ek ke do devices: 240 devices. Har radio par 50 active devices maan kar, 5 GHz ko lagbhag 240 / 50 ≈ 5 radios chahiye, yaani paanch alag 5 GHz channels par 5 APs, jaise 36, 40, 44, 48 aur 149. 2.4 GHz par sirf teen channels hain, isliye paanch APs ko apna apna nahi mil sakta; designer teen par 2.4 GHz kam power par enable karta hai (1, 6, 11) aur baaki do 2.4 GHz radios band ya monitor karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> "Behtar coverage ke liye" har AP ko maximum power par set karna. Isse bade overlapping cells, co-channel contention, asymmetric links aur sticky clients bante hain. Client ki power aur capacity target ke liye design karo, sabse bade cell ke liye nahi. "Lagbhag sahi" plans jaise 1, 3 aur 6 se bhi bacho: overlapping channels adjacent-channel interference karte hain, jo channel share karne se bura hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Survey types (predictive, AP-on-a-stick, passive, active, spectrum) aur RRM ke hisse jaano: channels ke liye DCA, power ke liye TPC, coverage hole detection. 2.4 GHz reuse pattern 1, 6, 11 hai jisme koi padosi cells same channel par nahi.</p></div>

<div class="scn"><h4>Predictive plan jo cabinets bhool gaya</h4><p>Ek finance floor ke predictive survey ne perfect −65 dBm coverage dikhaya. Go-live ke baad records room ke paas users ne drop-outs ki shikayat ki. Passive validation survey ne wahan −80 dBm dikhaya: poori oonchai ke metal filing cabinets ki do rows, jo floor plan mein nahi thi, signal ko reflect aur block kar rahi thi. Records area ke andar ek extra AP aur uske aas paas channel re-plan ne problem solve ki.</p><p><b>Seekh:</b> predictive surveys sahi deewar aur rukaavat data par depend karte hain; deployment ke baad hamesha validate karo.</p></div>

<div class="iv"><p class="q">"Ek naye teen-floor office ke liye aap Wi-Fi channels kaise plan karoge?"</p><p>Strong answer: requirements se shuru karo (coverage level jaise −67 dBm, device counts, applications, client capabilities), predictive survey karo aur mushkil areas site par validate karo. 5 GHz ko main band banao 20 ya 40 MHz channels ke saath taaki padosiyon ko alag karne ke liye kaafi channels hon, upar aur neeche ke floors samet. 2.4 GHz par honeycomb mein sirf 1, 6 aur 11 use karo, kam power par, aur cells zyada overlap karein to kuch radios band karo. Power aisi set karo ki roaming ke liye cells 15 se 20 % overlap karein, RRM (DCA aur TPC) ko fine-tune karne do, aur post-deployment validation survey se khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Requirements se design karo: coverage (voice ke liye −67 dBm, SNR ≥ 25 dB), capacity, roaming aur sabse kamzor client.</li>
<li>Survey types: predictive, AP-on-a-stick, passive, active aur spectrum analysis; deployment ke baad hamesha validate karo.</li>
<li>Honeycomb reuse: padosi kabhi channel share nahi karte; 2.4 GHz sirf 1, 6 aur 11 use karta hai.</li>
<li>Kam power se chhote cells aur zyada reuse; maximum power se contention aur sticky clients.</li>
<li>RRM channels (DCA), power (TPC) aur coverage holes automate karta hai.</li>
</ul></div>
`}};export{e as default};