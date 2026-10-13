var e={id:`search-scope`,h:{en:`Searching across devices and ADOMs; what Log View cannot see`,hi:`Devices aur ADOMs mein search; Log View kya nahi dekh sakta`},body:{en:`
<p>Imagine a library with three rooms: Corporate, Retail and Kaveri. Each room has its own shelves, and each FortiGate has been told to put its books in exactly one room. If you search the Retail room for a book that sits in Kaveri, you will find nothing, and the librarian will not say that you are in the wrong room. Log View behaves the same way, and there is also a locked cupboard (the archive) that the search never opens.</p>

<h3>Step 1: the ADOM decides where the logs live</h3>
<p>An <b>ADOM</b> (administrative domain) is a container on the FortiAnalyzer that keeps the logs and administrators of some devices apart from others. A registered device belongs to one ADOM, and its logs are stored there. With ADOM mode off, everything is in the built-in ADOM named <code>root</code>. The first word of the search command is the ADOM, so you must know where the device lives. The table of devices shows it in the ADOM column:</p>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      2        0      0      0         2026-10-12 20:48:07
TRY-FGT         FGVMEV3X688U0000    root      0        0      0      0         -</pre>
<p>This output also answers a second question without any search: how many logs of each type a device has delivered. A device with all zeros has delivered nothing, which is a logging problem, not a searching problem.</p>

<h3>Step 2: the device word</h3>
<p>The second word is a device name, or <code>-</code> for "all devices of this ADOM". Use a name when the ticket names a branch; use the dash when you do not know which FortiGate saw the traffic, for example when a user moves between sites.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ADOMs and archive">
<rect x="10" y="20" width="400" height="170" rx="10" fill="#e2e8f0"/><text x="210" y="42" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1 (192.0.2.6)</text>
<rect x="25" y="55" width="110" height="60" rx="8" fill="#bae6fd"/><text x="80" y="80" text-anchor="middle" class="svg-ink" font-size="12">ADOM Corporate</text><text x="80" y="98" text-anchor="middle" class="svg-muted" font-size="12">HQ-FGT</text>
<rect x="150" y="55" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="205" y="80" text-anchor="middle" class="svg-ink" font-size="12">ADOM Retail</text><text x="205" y="98" text-anchor="middle" class="svg-muted" font-size="12">MDU-FGT</text>
<rect x="275" y="55" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="330" y="80" text-anchor="middle" class="svg-ink" font-size="12">ADOM Kaveri</text><text x="330" y="98" text-anchor="middle" class="svg-muted" font-size="12">TRY-FGT</text>
<rect x="25" y="130" width="360" height="45" rx="8" fill="#fed7aa"/><text x="205" y="157" text-anchor="middle" class="svg-ink" font-size="12">Archive: old logs, not searchable</text>
<rect x="440" y="55" width="190" height="60" rx="8" fill="#fde68a"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="12">logview Retail MDU-FGT</text><text x="535" y="98" text-anchor="middle" class="svg-muted" font-size="12">searches analytics only</text>
<line x1="440" y1="85" x2="385" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One search sees one ADOM, and inside it only the analytics logs.</p></div>

<h3>Step 3: what happens with a wrong ADOM or device</h3>
<p>An ADOM that does not exist is refused. A device name that is not in the ADOM you chose is <b>not</b> refused; the search runs and finds nothing:</p>
<pre class="out">FAZ-1 # execute fazui logview Nowhere - traffic
ADOM 'Nowhere' does not exist.
FAZ-1 # execute fazui logview root NOPE traffic
Log View  adom=root device=NOPE type=traffic
<span class="hl">0 logs match, 0 shown (newest first).</span></pre>
<p>That second result looks exactly like "no traffic". Always confirm the ADOM and the spelling of the device before you trust a zero.</p>

<h3>Step 4: the archive is not searchable</h3>
<p>The FortiAnalyzer keeps logs in two states. <b>Analytics</b> logs are indexed and searchable, and they feed reports. After the analytics retention period (60 days by default) they move to the <b>archive</b>, which is compressed (a quarter of the size in the simulator), cannot be searched in Log View and is not used by reports. After the archive retention (365 days by default) they are deleted. The simulator does not let days pass by themselves, so the captured output below comes from a test that moved the clock forward 61 days:</p>
<pre class="out">FAZ-1 # execute fazui storage root
  Logs stored         : analytics <span class="hl">0</span> (traffic 0, utm 0, event 0), archive <span class="hl">4</span>
FAZ-1 # execute fazui logview root HQ-FGT all limit 3
<span class="hl">0 logs match, 0 shown (newest first).</span></pre>
<p>The four logs still exist, but Log View cannot show them. In the real product you would have to restore archived logs before searching; this simulator does not model that, so treat it as theory.</p>

<h3>Why it matters</h3>
<p>Three different problems all look like "0 logs": wrong ADOM or device, a device that never delivered logs, and logs that have aged into the archive. The order of checks is: ADOM and device spelling, the device table, then the age of the event.</p>

<div class="eg"><p><b>Worked example.</b> A manager asks about a session of 70 days ago. The analyst searches ADOM Retail, device MDU-FGT, and gets 0. The ADOM and the name are right, and the device table shows plenty of logs, so the cause is age: with the default 60 days those logs are in the archive. The answer is that this FortiAnalyzer cannot search them without a restore.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Searching root when the device was registered in another ADOM; mis-typing a device name and trusting the zero; assuming old logs are "deleted" when they are only archived; searching type traffic when the ticket is about a blocked application.</p></div>

<div class="exam"><p><b>Exam traps.</b> One search covers one ADOM. Only analytics logs are searchable and feed reports. Archived logs are neither. In the real product Log View is a GUI page with an ADOM selector, device selector, time range and filter bar; <code>execute fazui logview</code> is the simulator stand-in and has no time range.</p></div>

<div class="scn"><h4>The device in the other room</h4><p>After a reorganisation the Madurai FortiGate was moved from Corporate to Retail. An analyst kept searching Corporate for MDU-FGT and reported that Madurai had gone silent. The device table showed the ADOM column Retail, and the logs were there.</p><p><b>Lesson:</b> check the ADOM column of the device table before you say a branch is silent.</p></div>

<div class="iv"><p class="q">"Log View shows nothing for a device that you know is busy. What do you check?"</p><p>First the ADOM and the exact device name, then the device log counters to see whether the logs ever arrived, then the age of the period I am asking about, because analytics logs older than the retention period are only archived and not searchable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A search covers one ADOM; the device word is a name or a dash for all devices.</li>
<li>A wrong device name is not an error, it just returns zero.</li>
<li>diagnose log device shows the ADOM and the log counters of each device.</li>
<li>Only analytics logs are searchable; the archive is not searched and not reported.</li>
<li>The GUI Log View has a time range; the simulator command does not.</li>
</ul></div>
`,hi:`
<p>Ek library socho jisme teen rooms hain: Corporate, Retail aur Kaveri. Har room ki apni shelves hain, aur har FortiGate ko bola gaya hai ki apni books sirf ek room mein rakhe. Agar aap Retail room mein wo book dhoondho jo Kaveri mein hai, to kuch nahi milega, aur librarian nahi bolega ki aap galat room mein ho. Log View bhi aisa hi behave karta hai, aur ek locked cupboard (archive) bhi hai jise search kabhi nahi kholta.</p>

<h3>Step 1: ADOM decide karta hai logs kahan rehte hain</h3>
<p><b>ADOM</b> (administrative domain) FortiAnalyzer par ek container hai jo kuch devices ke logs aur administrators ko dusron se alag rakhta hai. Registered device ek ADOM ka hota hai, aur uske logs wahin store hote hain. ADOM mode off ho to sab built-in ADOM <code>root</code> mein hota hai. Search command ka pehla word ADOM hai, isliye aapko pata hona chahiye device kahan rehta hai. Device table ADOM column mein dikhati hai:</p>
<pre class="out">FAZ-1 # diagnose log device
Device          SN                  ADOM      Traffic  UTM    Event  Rejected  Last log
HQ-FGT          FGVMEV1RGF38I000    root      2        0      0      0         2026-10-12 20:48:07
TRY-FGT         FGVMEV3X688U0000    root      0        0      0      0         -</pre>
<p>Ye output bina kisi search ke ek doosre sawaal ka bhi jawab deta hai: device ne har type ke kitne logs deliver kiye. Jis device ke saare zero hain usne kuch deliver nahi kiya, jo logging problem hai, searching problem nahi.</p>

<h3>Step 2: device word</h3>
<p>Doosra word device name hai, ya <code>-</code> matlab "is ADOM ke saare devices". Jab ticket mein branch ka naam ho to name use karo; jab pata na ho ki traffic kaun se FortiGate ne dekha, jaise user sites ke beech move karta ho, to dash use karo.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ADOMs aur archive">
<rect x="10" y="20" width="400" height="170" rx="10" fill="#e2e8f0"/><text x="210" y="42" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1 (192.0.2.6)</text>
<rect x="25" y="55" width="110" height="60" rx="8" fill="#bae6fd"/><text x="80" y="80" text-anchor="middle" class="svg-ink" font-size="12">ADOM Corporate</text><text x="80" y="98" text-anchor="middle" class="svg-muted" font-size="12">HQ-FGT</text>
<rect x="150" y="55" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="205" y="80" text-anchor="middle" class="svg-ink" font-size="12">ADOM Retail</text><text x="205" y="98" text-anchor="middle" class="svg-muted" font-size="12">MDU-FGT</text>
<rect x="275" y="55" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="330" y="80" text-anchor="middle" class="svg-ink" font-size="12">ADOM Kaveri</text><text x="330" y="98" text-anchor="middle" class="svg-muted" font-size="12">TRY-FGT</text>
<rect x="25" y="130" width="360" height="45" rx="8" fill="#fed7aa"/><text x="205" y="157" text-anchor="middle" class="svg-ink" font-size="12">Archive: purane logs, searchable nahi</text>
<rect x="440" y="55" width="190" height="60" rx="8" fill="#fde68a"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="12">logview Retail MDU-FGT</text><text x="535" y="98" text-anchor="middle" class="svg-muted" font-size="12">sirf analytics search</text>
<line x1="440" y1="85" x2="385" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek search ek ADOM dekhta hai, aur uske andar sirf analytics logs.</p></div>

<h3>Step 3: galat ADOM ya device par kya hota hai</h3>
<p>Jo ADOM exist nahi karta wo refuse hota hai. Jo device name aapke chune hue ADOM mein nahi hai wo refuse <b>nahi</b> hota; search chalta hai aur kuch nahi milta:</p>
<pre class="out">FAZ-1 # execute fazui logview Nowhere - traffic
ADOM 'Nowhere' does not exist.
FAZ-1 # execute fazui logview root NOPE traffic
Log View  adom=root device=NOPE type=traffic
<span class="hl">0 logs match, 0 shown (newest first).</span></pre>
<p>Ye doosra result bilkul "no traffic" jaisa dikhta hai. Zero par bharosa karne se pehle hamesha ADOM aur device ki spelling confirm karo.</p>

<h3>Step 4: archive searchable nahi hai</h3>
<p>FortiAnalyzer logs ko do states mein rakhta hai. <b>Analytics</b> logs indexed aur searchable hote hain, aur reports ko feed karte hain. Analytics retention period (default 60 days) ke baad wo <b>archive</b> mein chale jaate hain, jo compressed hai (simulator mein size ka ek chauthai), Log View mein search nahi hota aur reports mein use nahi hota. Archive retention (default 365 days) ke baad wo delete ho jaate hain. Simulator mein din apne aap nahi guzarte, isliye neeche ka captured output ek test se hai jisme clock 61 din aage badhayi gayi:</p>
<pre class="out">FAZ-1 # execute fazui storage root
  Logs stored         : analytics <span class="hl">0</span> (traffic 0, utm 0, event 0), archive <span class="hl">4</span>
FAZ-1 # execute fazui logview root HQ-FGT all limit 3
<span class="hl">0 logs match, 0 shown (newest first).</span></pre>
<p>Chaar logs abhi bhi exist karte hain, par Log View unhe nahi dikha sakta. Real product mein search se pehle archived logs ko restore karna padta hai; ye simulator model nahi karta, isliye ise theory samjho.</p>

<h3>Yeh kyun zaroori hai</h3>
<p>Teen alag problems sab "0 logs" jaisi dikhti hain: galat ADOM ya device, wo device jisne kabhi logs deliver nahi kiye, aur wo logs jo archive mein chale gaye. Checks ka order hai: ADOM aur device ki spelling, device table, phir event ki age.</p>

<div class="eg"><p><b>Worked example.</b> Manager 70 din pehle ke session ke baare mein poochta hai. Analyst ADOM Retail, device MDU-FGT search karta hai aur 0 milta hai. ADOM aur name sahi hain, aur device table mein bahut logs dikhte hain, to wajah age hai: default 60 days ke saath wo logs archive mein hain. Jawab ye hai ki is FortiAnalyzer par restore ke bina unhe search nahi kar sakte.</p></div>

<div class="warn"><p><b>Common mistakes.</b> root search karna jabki device kisi aur ADOM mein registered hai; device name mis-type karke zero par bharosa karna; purane logs ko "deleted" samajhna jabki wo sirf archived hain; blocked application ke ticket par type traffic search karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Ek search ek ADOM cover karta hai. Sirf analytics logs searchable hain aur reports ko feed karte hain. Archived logs na searchable hain na reports mein. Real product mein Log View ek GUI page hai jisme ADOM selector, device selector, time range aur filter bar hota hai; <code>execute fazui logview</code> simulator ka stand-in hai aur isme time range nahi hai.</p></div>

<div class="scn"><h4>Doosre room ka device</h4><p>Reorganisation ke baad Madurai FortiGate ko Corporate se Retail mein move kiya gaya. Ek analyst Corporate mein MDU-FGT search karta raha aur report kiya ki Madurai chup ho gaya. Device table ke ADOM column mein Retail tha, aur logs wahin the.</p><p><b>Lesson:</b> branch ko silent kehne se pehle device table ka ADOM column check karo.</p></div>

<div class="iv"><p class="q">"Log View ek aise device ke liye kuch nahi dikhata jo busy hai. Aap kya check karte ho?"</p><p>Pehle ADOM aur exact device name, phir device log counters ki logs kabhi aaye ya nahi, phir us period ki age jiske baare mein pooch raha hoon, kyunki retention se purane analytics logs sirf archived hote hain aur searchable nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Search ek ADOM cover karta hai; device word name hai ya saare devices ke liye dash.</li>
<li>Galat device name error nahi hai, bas zero deta hai.</li>
<li>diagnose log device har device ka ADOM aur log counters dikhata hai.</li>
<li>Sirf analytics logs searchable hain; archive search aur report mein nahi aata.</li>
<li>GUI Log View mein time range hai; simulator command mein nahi.</li>
</ul></div>
`}};export{e as default};