var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Severity ladder 0 to 7">
<rect x="20" y="10" width="190" height="26" rx="6" fill="#fed7aa"/><text x="30" y="28" class="svg-ink" font-size="12">0 emergencies  system unusable</text>
<rect x="20" y="40" width="190" height="26" rx="6" fill="#fed7aa"/><text x="30" y="58" class="svg-ink" font-size="12">1 alerts  act at once</text>
<rect x="20" y="70" width="190" height="26" rx="6" fill="#fed7aa"/><text x="30" y="88" class="svg-ink" font-size="12">2 critical  hard failure</text>
<rect x="20" y="100" width="190" height="26" rx="6" fill="#fde68a"/><text x="30" y="118" class="svg-ink" font-size="12">3 errors  something failed</text>
<rect x="20" y="130" width="190" height="26" rx="6" fill="#fde68a"/><text x="30" y="148" class="svg-ink" font-size="12">4 warnings  may become bad</text>
<rect x="20" y="160" width="190" height="26" rx="6" fill="#bbf7d0"/><text x="30" y="178" class="svg-ink" font-size="12">5 notifications  normal, notable</text>
<rect x="20" y="190" width="190" height="26" rx="6" fill="#bbf7d0"/><text x="30" y="208" class="svg-ink" font-size="12">6 informational  routine</text>
<rect x="230" y="190" width="190" height="26" rx="6" fill="#e2e8f0"/><text x="240" y="208" class="svg-ink" font-size="12">7 debugging  very chatty</text>
<line x1="440" y1="24" x2="440" y2="206" stroke="#64748b" stroke-width="2"/>
<text x="460" y="40" class="svg-accent" font-size="13">lower number</text><text x="460" y="58" class="svg-accent" font-size="13">= more urgent</text>
<text x="460" y="120" class="svg-muted" font-size="12">trap level N sends</text><text x="460" y="138" class="svg-muted" font-size="12">severity 0 up to N</text>
</svg>`,t={id:`severity-facility-formats`,h:{en:`Severity, facility and message formats`,hi:`Severity, facility aur message formats`},body:{en:`
<h3>Why this chapter matters</h3>
<p>A busy router writes hundreds of messages a day. Most are routine; a few mean trouble. Syslog gives every message a <b>severity</b> number so that both people and tools can decide what to look at. It also gives a <b>facility</b>, which says which part of the system produced the message. If you understand these two numbers and the shape of a message, you can read any log from any vendor.</p>

<h3>The eight severities</h3>
<p>Severity runs from 0 to 7. The surprising rule is that <b>a lower number is more serious</b>. Learn the names in order, because exams ask for them.</p>
<div class="dia">`+e+`<p class="cap">Severity 0 is the worst. A trap level of N sends every message from 0 up to and including N.</p></div>
<table class="cmp"><tr><th>No.</th><th>Name</th><th>Keyword</th><th>Typical example</th></tr>
<tr><td>0</td><td>Emergency</td><td>emergencies</td><td>router cannot continue, system unusable</td></tr>
<tr><td>1</td><td>Alert</td><td>alerts</td><td>temperature limit exceeded, act immediately</td></tr>
<tr><td>2</td><td>Critical</td><td>critical</td><td>hardware or process failure</td></tr>
<tr><td>3</td><td>Error</td><td>errors</td><td>interface changed state to down</td></tr>
<tr><td>4</td><td>Warning</td><td>warnings</td><td>high CPU, duplex mismatch suspected</td></tr>
<tr><td>5</td><td>Notice</td><td>notifications</td><td>line protocol up, configuration saved</td></tr>
<tr><td>6</td><td>Informational</td><td>informational</td><td>access list permit or deny hit, DHCP lease</td></tr>
<tr><td>7</td><td>Debug</td><td>debugging</td><td>output of debug commands</td></tr></table>
<p>A memory trick many engineers use: <b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily gives Emergency, Alert, Critical, Error, Warning, Notice, Informational, Debug.</p>

<h3>Facility: which part of the system spoke</h3>
<p>The syslog standard defines a <b>facility</b> number from 0 to 23, such as kernel (0), user (1), mail (2), daemon (3), auth (4), syslog (5), and local0 to local7 (16 to 23). On a server, programs choose their own facility. On a network device, the facility on the wire is usually one of the local values, and Cisco IOS defaults to <b>local7</b>. The collector can then sort messages: all local7 into the network file, all auth into the security file.</p>
<div class="note"><p><b>Do not confuse two meanings of "facility".</b> Inside a Cisco message such as <code>%LINK-3-UPDOWN</code>, the word LINK is the name of the software component that produced it, also called a facility in Cisco text. The syslog facility (local7) is a separate number carried in the packet header. One is a label for humans, the other a routing field for the collector.</p></div>

<h3>Priority: facility and severity in one number</h3>
<p>On the wire, a syslog packet starts with a <b>PRI</b> value in angle brackets. PRI equals facility times 8 plus severity. For facility local7 (23) and severity informational (6): 23 x 8 + 6 = 190. So the packet begins with <code>&lt;190&gt;</code>. A collector divides by 8 to get the facility and keeps the remainder as the severity.</p>
<div class="eg"><p><b>Worked example.</b> A packet starts with <code>&lt;187&gt;</code>. Divide 187 by 8: the quotient is 23 and the remainder is 3. So facility local7, severity error. That is the message for an interface that went down.</p></div>

<h3>Anatomy of a Cisco message</h3>
<pre class="out">Oct  7 09:00:12.431: <span class="hl">%LINK-3-UPDOWN</span>: Interface GigabitEthernet0/2, changed state to down
Oct  7 09:00:13.433: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Oct  7 09:04:50.007: %SYS-5-CONFIG_I: Configured from console by priya on vty0 (10.1.50.77)</pre>
<ul>
<li><b>Timestamp</b> (<code>Oct  7 09:00:12.431</code>): set by <code>service timestamps log datetime msec</code>. A leading asterisk before it means the clock is not synchronised.</li>
<li><b>%FACILITY-SEVERITY-MNEMONIC</b>: here LINK is the component, 3 is the severity (error) and UPDOWN is the short name of the event. This pattern is how you search: grep for <code>-3-</code> to find errors.</li>
<li><b>Text</b>: the human sentence with interface names, users and addresses.</li>
</ul>
<p>With <code>service sequence-numbers</code> the router also adds a counter, so a collector can see that message 120 is followed by 123 and know two were lost on the way. That is a cheap defence against silent UDP loss.</p>

<h3>What the collector stores</h3>
<p>The receiving server adds its own data around the device text: the time it received the line, and the sender's IP address. A line in the file for R-HYD looks like this:</p>
<pre class="out">Oct  7 09:00:12 10.255.0.1 118: Oct  7 09:00:12.431: %LINK-3-UPDOWN: Interface GigabitEthernet0/2, changed state to down</pre>
<p>The first time is the server's receive time. The second, inside the text, is the device's own time. If these differ by minutes, the device clock is wrong. Chapter 3 shows how NTP removes the problem.</p>

<h3>Other formats you will meet</h3>
<ul>
<li><b>RFC 3164 (old, BSD style)</b>: the format above. Time has no year and no time zone, which is why NTP and consistent time zones matter.</li>
<li><b>RFC 5424 (new)</b>: a version number, an ISO timestamp with year and time zone, hostname, application name, process ID, message ID and optional structured data. Linux servers and many firewalls send it.</li>
<li><b>Vendor key=value logs</b>: some firewalls send <code>action=deny src=203.0.113.9 dst=10.1.20.10</code>. Same transport, different text inside.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading severity as "bigger number, worse problem". It is the opposite. (2) Setting a trap level of debugging "to be safe", which floods the collector. (3) Treating the facility inside the message (LINK, SYS) as the syslog facility used for sorting. (4) Searching logs by text only; searching by the severity digit is faster.</p></div>
<div class="exam"><p><b>Exam trap.</b> Severity 7 is debugging, severity 6 is informational and severity 0 is emergencies. A question asking for the default level of logging to the console says debugging (7), and the default buffer and trap levels vary by platform, so read the output of show logging instead of guessing.</p></div>

<div class="scn"><h4>The error that was hiding in plain sight</h4><p>Meena Iyer asked why nobody noticed a failing power supply at Lucknow. The messages existed on NMS, but the file held 40,000 lines a day and all looked alike. Once the team learned to filter on the severity digit, a search for severity 2 and 1 returned three lines in a week, including the power supply warning two days before the outage. They then made a saved search for severities 0 to 3 and checked it each morning.</p><p><b>Lesson:</b> severity is the first filter. Use it before reading anything.</p></div>

<div class="iv"><p class="q">"What is the difference between syslog severity and facility?"</p><p>Strong answer: severity is 0 to 7 and says how urgent the event is, with 0 most urgent. Facility says which subsystem or category produced the message and is used by the collector to sort. Both are packed into the PRI value as facility times 8 plus severity. Add that Cisco messages also carry a component name in the %FACILITY-SEVERITY-MNEMONIC text, which is a different thing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Severities run 0 emergencies to 7 debugging, and lower is more urgent.</li>
<li>PRI = facility x 8 + severity; Cisco defaults to facility local7, so informational is 190.</li>
<li>A Cisco message reads timestamp, %COMPONENT-SEVERITY-MNEMONIC, then text.</li>
<li>Sequence numbers reveal lost messages; timestamps without NTP mislead.</li>
<li>RFC 3164 is the old format; RFC 5424 adds year, time zone and structured data.</li>
</ul></div>
`,hi:`
<h3>Yeh chapter kyun zaroori hai</h3>
<p>Ek busy router din mein sainkdon messages likhta hai. Zyada tar routine hote hain; kuch hi trouble batate hain. Syslog har message ko ek <b>severity</b> number deta hai taaki insaan aur tools dono decide kar sakein ki kya dekhna hai. Saath mein ek <b>facility</b> bhi deta hai, jo batati hai ki system ke kis hisse ne message banaya. In do numbers aur message ki shape samajh gaye to aap kisi bhi vendor ka log padh sakte ho.</p>

<h3>Aath severities</h3>
<p>Severity 0 se 7 tak chalti hai. Hairan karne wala rule yeh hai ki <b>chhota number zyada serious hai</b>. Names ko order mein yaad karo, kyunki exam mein poochhe jaate hain.</p>
<div class="dia">`+e+`<p class="cap">Severity 0 sabse buri hai. Trap level N, 0 se N tak ke saare messages bhejta hai.</p></div>
<table class="cmp"><tr><th>No.</th><th>Name</th><th>Keyword</th><th>Typical example</th></tr>
<tr><td>0</td><td>Emergency</td><td>emergencies</td><td>router aage nahi chal sakta, system unusable</td></tr>
<tr><td>1</td><td>Alert</td><td>alerts</td><td>temperature limit cross, turant action</td></tr>
<tr><td>2</td><td>Critical</td><td>critical</td><td>hardware ya process failure</td></tr>
<tr><td>3</td><td>Error</td><td>errors</td><td>interface changed state to down</td></tr>
<tr><td>4</td><td>Warning</td><td>warnings</td><td>high CPU, duplex mismatch ka shak</td></tr>
<tr><td>5</td><td>Notice</td><td>notifications</td><td>line protocol up, configuration saved</td></tr>
<tr><td>6</td><td>Informational</td><td>informational</td><td>access list permit ya deny hit, DHCP lease</td></tr>
<tr><td>7</td><td>Debug</td><td>debugging</td><td>debug commands ka output</td></tr></table>
<p>Yaad rakhne ki ek trick: <b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily, yaani Emergency, Alert, Critical, Error, Warning, Notice, Informational, Debug.</p>

<h3>Facility: system ke kis hisse ne bola</h3>
<p>Syslog standard ek <b>facility</b> number 0 se 23 tak define karta hai, jaise kernel (0), user (1), mail (2), daemon (3), auth (4), syslog (5), aur local0 se local7 (16 se 23). Server par programs apni facility khud chunte hain. Network device par wire par facility aam taur par local values mein se ek hoti hai, aur Cisco IOS ka default <b>local7</b> hai. Collector phir messages sort kar sakta hai: saare local7 network file mein, saare auth security file mein.</p>
<div class="note"><p><b>"Facility" ke do matlab mix mat karo.</b> Cisco message <code>%LINK-3-UPDOWN</code> ke andar LINK us software component ka naam hai jisne message banaya, Cisco text mein ise bhi facility kehte hain. Syslog facility (local7) alag number hai jo packet header mein jaata hai. Ek insaano ke liye label hai, doosra collector ke liye routing field.</p></div>

<h3>Priority: facility aur severity ek number mein</h3>
<p>Wire par syslog packet ki shuruaat angle brackets mein ek <b>PRI</b> value se hoti hai. PRI barabar hai facility ko 8 se guna karke severity jodne ke. Facility local7 (23) aur severity informational (6) ke liye: 23 x 8 + 6 = 190. To packet <code>&lt;190&gt;</code> se shuru hota hai. Collector 8 se divide karke facility nikalta hai aur remainder ko severity rakhta hai.</p>
<div class="eg"><p><b>Worked example.</b> Ek packet <code>&lt;187&gt;</code> se shuru hota hai. 187 ko 8 se divide karo: quotient 23 aur remainder 3. Matlab facility local7, severity error. Yeh us interface ka message hai jo down hua.</p></div>

<h3>Cisco message ki anatomy</h3>
<pre class="out">Oct  7 09:00:12.431: <span class="hl">%LINK-3-UPDOWN</span>: Interface GigabitEthernet0/2, changed state to down
Oct  7 09:00:13.433: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Oct  7 09:04:50.007: %SYS-5-CONFIG_I: Configured from console by priya on vty0 (10.1.50.77)</pre>
<ul>
<li><b>Timestamp</b> (<code>Oct  7 09:00:12.431</code>): <code>service timestamps log datetime msec</code> se lagta hai. Timestamp se pehle asterisk ka matlab hai clock synchronised nahi hai.</li>
<li><b>%FACILITY-SEVERITY-MNEMONIC</b>: yahan LINK component hai, 3 severity (error) hai aur UPDOWN event ka chhota naam hai. Search isi pattern se hota hai: errors dhoondhne ke liye <code>-3-</code> grep karo.</li>
<li><b>Text</b>: insaani sentence jisme interface names, users aur addresses hote hain.</li>
</ul>
<p><code>service sequence-numbers</code> ke saath router ek counter bhi lagata hai, to collector dekh sakta hai ki message 120 ke baad 123 aaya aur samajh sakta hai ki do raaste mein kho gaye. Yeh silent UDP loss ke khilaf sasta bachav hai.</p>

<h3>Collector kya store karta hai</h3>
<p>Receive karne wala server device ke text ke aas-paas apna data jodta hai: line receive karne ka time, aur sender ka IP address. R-HYD ki file mein ek line aisi dikhti hai:</p>
<pre class="out">Oct  7 09:00:12 10.255.0.1 118: Oct  7 09:00:12.431: %LINK-3-UPDOWN: Interface GigabitEthernet0/2, changed state to down</pre>
<p>Pehla time server ka receive time hai. Text ke andar wala doosra time device ka apna time hai. Agar yeh dono minutes se alag hain, to device ki clock galat hai. Chapter 3 dikhata hai ki NTP is problem ko kaise hata deta hai.</p>

<h3>Doosre formats jo aap dekhoge</h3>
<ul>
<li><b>RFC 3164 (purana, BSD style)</b>: upar wala format. Time mein year aur time zone nahi hota, isiliye NTP aur consistent time zones matter karte hain.</li>
<li><b>RFC 5424 (naya)</b>: version number, year aur time zone ke saath ISO timestamp, hostname, application name, process ID, message ID aur optional structured data. Linux servers aur kai firewalls yahi bhejte hain.</li>
<li><b>Vendor key=value logs</b>: kuch firewalls <code>action=deny src=203.0.113.9 dst=10.1.20.10</code> bhejte hain. Transport wahi, andar ka text alag.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> (1) Severity ko "bada number, bada problem" padhna. Yeh ulta hai. (2) "Safe rehne ke liye" trap level debugging kar dena, jisse collector par flood aata hai. (3) Message ke andar wali facility (LINK, SYS) ko sorting wali syslog facility samajhna. (4) Sirf text se logs search karna; severity digit se search karna tez hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Severity 7 debugging hai, severity 6 informational hai aur severity 0 emergencies hai. Console logging ka default level poochhe to jawab debugging (7) hai, aur buffer aur trap ke default levels platform ke hisaab se alag hote hain, to guess mat karo, show logging ka output padho.</p></div>

<div class="scn"><h4>Woh error jo saamne hi chhupa tha</h4><p>Meena Iyer ne poochha ki Lucknow mein failing power supply kisi ko dikhi kyun nahi. Messages NMS par the, lekin file mein roz 40,000 lines thi aur sab ek jaisi dikhti thi. Jab team ne severity digit par filter karna seekha, to severity 2 aur 1 ki search ne hafte mein sirf teen lines dikhayi, jisme outage se do din pehle ka power supply warning bhi tha. Phir unhone severity 0 se 3 ki saved search banayi aur har subah check ki.</p><p><b>Seekh:</b> severity pehla filter hai. Kuch bhi padhne se pehle use lagao.</p></div>

<div class="iv"><p class="q">"Syslog severity aur facility mein kya fark hai?"</p><p>Strong answer: severity 0 se 7 hai aur batati hai ki event kitna urgent hai, 0 sabse urgent. Facility batati hai ki kaun sa subsystem ya category ne message banaya aur collector use sort karne ke liye use karta hai. Dono PRI value mein pack hote hain: facility x 8 + severity. Yeh bhi jodo ki Cisco messages ke %FACILITY-SEVERITY-MNEMONIC text mein ek component name hota hai, jo alag cheez hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Severities 0 emergencies se 7 debugging tak hain, aur chhota number zyada urgent hai.</li>
<li>PRI = facility x 8 + severity; Cisco ka default facility local7 hai, to informational 190 hai.</li>
<li>Cisco message mein timestamp, %COMPONENT-SEVERITY-MNEMONIC, phir text hota hai.</li>
<li>Sequence numbers lost messages dikhate hain; NTP ke bina timestamps bhatkate hain.</li>
<li>RFC 3164 purana format hai; RFC 5424 year, time zone aur structured data jodta hai.</li>
</ul></div>
`}};export{t as default};