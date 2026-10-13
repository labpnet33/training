var e={id:`tx-power-cells`,h:{en:`Transmit power, cell size and power levels`,hi:`Transmit power, cell size aur power levels`},body:{en:`
<p>Transmit power decides how far an AP's signal reaches. More power looks attractive, because it fills coverage gaps, but in a multi-AP network it is one of the most common causes of poor performance. This chapter explains why, how the controller expresses power, and how to read the power level shown in the lab.</p>

<h3>The cell and the overlap</h3>
<p>The area where a client can use an AP is its <b>cell</b>. Cell size depends on transmit power, band, antenna and obstacles. In a design with many APs, cells must overlap a little, so a walking user always has a next AP, but must not overlap a lot. Typical guidance: neighbouring cells overlap by 15 to 20 percent for roaming, and APs on the same channel are kept far enough apart that they do not hear each other above -82 dBm (the lab's AP-to-AP hearing level).</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="High power versus right-sized power">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Too much power</text>
<circle cx="110" cy="110" r="70" fill="#fed7aa" fill-opacity="0.6" stroke="#64748b"/><circle cx="210" cy="110" r="70" fill="#fde68a" fill-opacity="0.6" stroke="#64748b"/>
<text x="110" y="114" text-anchor="middle" class="svg-ink" font-size="12">AP1</text><text x="210" y="114" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<text x="160" y="205" text-anchor="middle" class="svg-muted" font-size="11">huge overlap: they share airtime</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Right-sized power</text>
<circle cx="440" cy="110" r="45" fill="#bbf7d0" fill-opacity="0.7" stroke="#64748b"/><circle cx="520" cy="110" r="45" fill="#bae6fd" fill-opacity="0.7" stroke="#64748b"/>
<text x="440" y="114" text-anchor="middle" class="svg-ink" font-size="12">AP1</text><text x="520" y="114" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="11">small overlap: more parallel capacity</text>
</svg><p class="cap">Smaller cells mean more of them work in parallel. That is how a design gains capacity.</p></div>

<h3>Why not simply maximum power?</h3>
<ul>
<li><b>Overlap grows,</b> so more APs hear each other and contend for the same airtime (co-channel interference).</li>
<li><b>Asymmetry:</b> clients transmit at lower power than APs. A client may hear the AP at -65 dBm but the AP may hear the client at -85 dBm, so the link fails or runs with many retries. Full bars, no connectivity.</li>
<li><b>Sticky clients:</b> a client holds on to a distant AP because it still hears it well, instead of roaming to a nearer one.</li>
<li><b>Neighbour pollution:</b> your high-power AP degrades the channel for the office next door, and theirs for you.</li>
</ul>
<p>Why not too little? Coverage holes appear: places where the signal is under -72 dBm or SNR is too low, and where roaming clients cannot find a next AP. The right level is found by survey and verified in use. A common 5 GHz target is -67 dBm at the cell edge with the client's power in mind.</p>

<h3>dBm, mW and power levels</h3>
<p>Enterprise APs offer power as <b>levels</b>, not raw dBm: level 1 is the highest, and each step is typically 3 dB lower (half the power). On the 9800 and AireOS family you will see "power level 1 to 8". The lab model matches that: level 1 is 20 dBm and each level is 3 dB lower:</p>
<table class="cmp"><tr><th>Level</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
<tr><td>dBm</td><td>20</td><td>17</td><td>14</td><td>11</td><td>8</td><td>5</td><td>2</td><td>-1</td></tr>
<tr><td>Relative power</td><td>100%</td><td>50%</td><td>25%</td><td>12.5%</td><td>6%</td><td>3%</td><td>1.6%</td><td>0.8%</td></tr>
</table>
<p>There are two ways to set power. A static override per AP radio uses <code>ap name AP1 dot11 5ghz txpower 3</code> (level 1 to 8, level 1 is highest). A band-wide policy uses an RF profile with <code>tx-power max 14</code>, expressed in dBm, which you meet in chapter 7. The lab converts the dBm cap into a level: 14 dBm becomes level 3. A tx-power max of 20 or higher keeps level 1; 17 gives level 2; 11 gives level 4.</p>

<div class="eg"><p><b>Worked example.</b> A 5 GHz AP at 20 dBm gives a cell edge at the client floor of -72 dBm. Dropping it by two levels (6 dB) cuts the received level by 6 dB everywhere, so the cell edge moves in. Using the path loss rule (35 times log of distance), 6 dB less power shrinks the cell radius by a factor of 10 to the power 6/35, about 1.5 times smaller. The cell area is then about 2.2 times smaller. Two such APs on the same channel need less spacing before they stop hearing each other, so you can reuse channels more often.</p></div>

<h3>Matching 2.4 GHz and 5 GHz power</h3>
<p>Since 5 GHz loses about 6 dB more than 2.4 GHz, an AP at equal power on both bands has a smaller 5 GHz cell. Designers therefore keep 2.4 GHz power deliberately lower, often 6 dB below 5 GHz, so that dual-band clients see the 5 GHz signal as the stronger one and prefer it. Also, use fewer 2.4 GHz radios: in a dense office, every second or third AP can have its 2.4 GHz radio in monitor or off.</p>

<h3>Checking the result in the lab</h3>
<pre class="code">WLC1# ap name AP1 dot11 5ghz txpower 3
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4402  Enabled   36       <span class="hl">3</span>
AP2                  All      0011.2233.4412  Enabled   40       1</pre>
<p>Remember the command accepts only 1 to 8. A request such as <code>txpower 9</code> is rejected with the message that the power level must be 1-8 (1 = highest). The correct mental model: a <i>smaller number means a stronger signal</i>.</p>

<div class="warn"><p><b>Common mistakes.</b> Mixing up levels and dBm (level 3 is 14 dBm, not 3 dBm); raising power on one AP to "fix" a complaint and breaking the neighbour's channel; forgetting that a static txpower override is stored in the configuration and stays until changed, while in the lab an RF profile cap on the same radio takes precedence.</p></div>
<div class="exam"><p><b>Exam trap.</b> Power level 1 is the maximum, not the minimum. A higher level number means lower power. Also: doubling the number of APs does not double capacity if power is not reduced.</p></div>

<div class="scn"><h4>Full power in the classroom block</h4><p>A college installed 20 APs in one block, all at the highest power. Wireless was slower than before the upgrade. The survey tool showed each AP heard eight neighbours above -82 dBm on the same channel. Setting 5 GHz to level 3 (14 dBm), 2.4 GHz to level 5 and turning off every third 2.4 GHz radio cut co-channel neighbours to two or three and doubled measured throughput.</p><p><b>Lesson:</b> after adding APs, you usually lower power, not raise it.</p></div>

<div class="iv"><p class="q">"Users have full bars but poor performance. Would you increase AP power?"</p><p>No. Check SNR, retries, channel utilisation and the client-to-AP direction. Strong downlink with weak uplink is typical of excess AP power. Often the fix is lower AP power plus a better channel plan so cells are small and clients roam properly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cell size follows transmit power; capacity comes from many small cells.</li>
<li>Too much power causes overlap, asymmetric links and sticky clients.</li>
<li>Levels 1 to 8: level 1 is highest, each step about 3 dB lower (lab: 20 dBm down to -1).</li>
<li>Keep 2.4 GHz power lower than 5 GHz power to nudge clients to 5 GHz.</li>
<li>ap name AP1 dot11 5ghz txpower N is a static override; tx-power max in an RF profile is a band policy.</li>
</ul></div>
`,hi:`
<p>Transmit power decide karta hai ki AP ka signal kitni door tak pahunchta hai. Zyada power attractive lagti hai kyunki woh coverage gaps bharti hai, lekin multi-AP network mein yeh poor performance ke sabse common causes mein se ek hai. Yeh chapter samjhata hai kyun, controller power ko kaise express karta hai, aur lab mein dikhne wala power level kaise padhein.</p>

<h3>Cell aur overlap</h3>
<p>Jis area mein client AP ko use kar sakta hai woh uski <b>cell</b> hai. Cell size transmit power, band, antenna aur obstacles par depend karta hai. Bahut saare APs wale design mein cells thodi overlap karni chahiye, taaki chalte user ke paas hamesha agla AP ho, lekin zyada overlap nahi. Typical guidance: neighbouring cells roaming ke liye 15 se 20 percent overlap karein, aur same channel wale APs itne door rakhe jaayein ki woh ek dusre ko -82 dBm (lab ka AP-to-AP hearing level) se upar na sunein.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Zyada power aur sahi power">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Zyada power</text>
<circle cx="110" cy="110" r="70" fill="#fed7aa" fill-opacity="0.6" stroke="#64748b"/><circle cx="210" cy="110" r="70" fill="#fde68a" fill-opacity="0.6" stroke="#64748b"/>
<text x="110" y="114" text-anchor="middle" class="svg-ink" font-size="12">AP1</text><text x="210" y="114" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<text x="160" y="205" text-anchor="middle" class="svg-muted" font-size="11">bada overlap: airtime share hota hai</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Sahi size ki power</text>
<circle cx="440" cy="110" r="45" fill="#bbf7d0" fill-opacity="0.7" stroke="#64748b"/><circle cx="520" cy="110" r="45" fill="#bae6fd" fill-opacity="0.7" stroke="#64748b"/>
<text x="440" y="114" text-anchor="middle" class="svg-ink" font-size="12">AP1</text><text x="520" y="114" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="11">chhota overlap: zyada parallel capacity</text>
</svg><p class="cap">Chhoti cells matlab zyada cells parallel kaam karti hain. Isi tarah design capacity paata hai.</p></div>

<h3>Seedha maximum power kyun nahi?</h3>
<ul>
<li><b>Overlap badhta hai,</b> isliye zyada APs ek dusre ko sunte hain aur same airtime ke liye contend karte hain (co-channel interference).</li>
<li><b>Asymmetry:</b> clients APs se kam power par transmit karte hain. Client AP ko -65 dBm par sun sakta hai lekin AP client ko -85 dBm par sunta hai, isliye link fail hota hai ya bahut retries ke saath chalta hai. Full bars, connectivity nahi.</li>
<li><b>Sticky clients:</b> client door ke AP se chipka rehta hai kyunki woh use ab bhi achhe se sunta hai, paas ke AP par roam karne ki jagah.</li>
<li><b>Padosi pollution:</b> aapka high-power AP bagal ke office ka channel kharab karta hai, aur unka aapka.</li>
</ul>
<p>Bahut kam kyun nahi? Coverage holes aa jaate hain: aisi jagahen jahan signal -72 dBm se neeche ya SNR kam ho, aur jahan roaming clients ko agla AP nahi milta. Sahi level survey se milta hai aur use mein verify hota hai. Common 5 GHz target cell edge par -67 dBm hai, client ki power ko dhyan mein rakhte hue.</p>

<h3>dBm, mW aur power levels</h3>
<p>Enterprise APs power ko raw dBm mein nahi balki <b>levels</b> mein dete hain: level 1 sabse high hai, aur har step aam taur par 3 dB neeche (aadhi power). 9800 aur AireOS family mein aap "power level 1 se 8" dekhoge. Lab model yahi match karta hai: level 1 20 dBm hai aur har level 3 dB neeche:</p>
<table class="cmp"><tr><th>Level</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
<tr><td>dBm</td><td>20</td><td>17</td><td>14</td><td>11</td><td>8</td><td>5</td><td>2</td><td>-1</td></tr>
<tr><td>Relative power</td><td>100%</td><td>50%</td><td>25%</td><td>12.5%</td><td>6%</td><td>3%</td><td>1.6%</td><td>0.8%</td></tr>
</table>
<p>Power set karne ke do tareeke hain. Per AP radio static override <code>ap name AP1 dot11 5ghz txpower 3</code> use karta hai (level 1 se 8, level 1 sabse high). Band-wide policy RF profile ke <code>tx-power max 14</code> se hoti hai, jo dBm mein express hota hai, aur jise aap chapter 7 mein dekhoge. Lab dBm cap ko level mein badalta hai: 14 dBm level 3 ban jaata hai. 20 ya usse upar ka tx-power max level 1 rakhta hai; 17 level 2 deta hai; 11 level 4.</p>

<div class="eg"><p><b>Worked example.</b> 20 dBm par 5 GHz AP ka cell edge client floor -72 dBm par aata hai. Do level kam karne (6 dB) se received level har jagah 6 dB kam ho jaata hai, isliye cell edge andar aa jaata hai. Path loss rule (distance ke log ka 35 guna) se 6 dB kam power cell radius ko lagbhag 1.5 guna chhota karti hai. Cell area lagbhag 2.2 guna chhota hota hai. Aise do APs ko same channel par ek dusre ko sunne se rukne ke liye kam spacing chahiye, isliye aap channels zyada baar reuse kar sakte ho.</p></div>

<h3>2.4 GHz aur 5 GHz power match karna</h3>
<p>Kyunki 5 GHz lagbhag 6 dB zyada loss karta hai 2.4 GHz se, dono bands par barabar power wale AP ki 5 GHz cell chhoti hoti hai. Isliye designers 2.4 GHz power jaan-boojh kar kam rakhte hain, aksar 5 GHz se 6 dB neeche, taaki dual-band clients 5 GHz signal ko strong dekhein aur use prefer karein. Saath hi 2.4 GHz radios kam use karo: dense office mein har doosre ya teesre AP ka 2.4 GHz radio monitor ya off ho sakta hai.</p>

<h3>Lab mein result check karna</h3>
<pre class="code">WLC1# ap name AP1 dot11 5ghz txpower 3
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4402  Enabled   36       <span class="hl">3</span>
AP2                  All      0011.2233.4412  Enabled   40       1</pre>
<p>Yaad rakho command sirf 1 se 8 accept karta hai. <code>txpower 9</code> jaisi request reject hoti hai aur message aata hai ki power level 1-8 hona chahiye (1 = highest). Sahi mental model: <i>chhota number matlab strong signal</i>.</p>

<div class="warn"><p><b>Common galtiyan.</b> Levels aur dBm ko mix karna (level 3 matlab 14 dBm, 3 dBm nahi); ek complaint "fix" karne ke liye ek AP ki power badhana aur padosi ka channel bigaadna; yeh bhool jaana ki static txpower override configuration mein store hota hai aur badalne tak rehta hai, jabki lab mein usi radio par RF profile cap precedence leta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Power level 1 maximum hai, minimum nahi. Badha hua level number matlab kam power. Saath hi: APs ki sankhya double karne se capacity double nahi hoti agar power kam nahi ki gayi.</p></div>

<div class="scn"><h4>Classroom block mein full power</h4><p>Ek college ne ek block mein 20 APs lagaye, sab highest power par. Wireless upgrade se pehle se bhi slow ho gaya. Survey tool ne dikhaya ki har AP same channel par aath neighbours ko -82 dBm se upar sunta tha. 5 GHz ko level 3 (14 dBm), 2.4 GHz ko level 5 par set karne aur har teesre 2.4 GHz radio ko band karne se co-channel neighbours do ya teen reh gaye aur measured throughput double ho gaya.</p><p><b>Seekh:</b> APs add karne ke baad aap aam taur par power kam karte ho, badhate nahi.</p></div>

<div class="iv"><p class="q">"Users ko full bars hain lekin performance kharab hai. Kya aap AP power badhaoge?"</p><p>Nahi. SNR, retries, channel utilisation aur client-to-AP direction check karo. Strong downlink ke saath weak uplink excess AP power ka typical sign hai. Aksar fix hai kam AP power aur behtar channel plan taaki cells chhoti hon aur clients sahi roam karein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cell size transmit power follow karta hai; capacity kai chhoti cells se aati hai.</li>
<li>Bahut zyada power overlap, asymmetric links aur sticky clients banati hai.</li>
<li>Levels 1 se 8: level 1 highest, har step lagbhag 3 dB neeche (lab: 20 dBm se -1 tak).</li>
<li>2.4 GHz power ko 5 GHz se kam rakho taaki clients 5 GHz par jaayein.</li>
<li>ap name AP1 dot11 5ghz txpower N static override hai; RF profile ka tx-power max band policy hai.</li>
</ul></div>
`}};export{e as default};