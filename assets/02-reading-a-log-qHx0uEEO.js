var e={id:`reading-a-log`,h:{en:`Reading a log: the fields that matter`,hi:`Log padhna: zaroori fields`},body:{en:`
<p>A parcel label tells you who sent it, who receives it, which courier handled it, whether it was delivered or refused, and when. A firewall log is exactly such a label, only with more boxes. Beginners often stare at one long line of key=value pairs and give up. The trick is to read it in five groups, and to learn the dozen fields that answer almost every ticket.</p>

<h3>Step 1: the five groups</h3>
<p>Every log is a list of <b>fields</b>. A field is a name and a value written as <code>name=value</code>. Read them in this order:</p>
<ol>
<li><b>Which device and when:</b> <code>devname</code>, <code>devid</code> (the serial number), <code>date</code>, <code>time</code> and <code>itime</code>.</li>
<li><b>Who:</b> <code>srcip</code>, <code>srcport</code>, <code>srcintf</code>.</li>
<li><b>To where:</b> <code>dstip</code>, <code>dstport</code>, <code>dstintf</code>, <code>service</code>, <code>proto</code>.</li>
<li><b>Decision:</b> <code>action</code>, <code>utmaction</code>, <code>policyid</code>, <code>policyname</code>.</li>
<li><b>What it was:</b> <code>app</code>, <code>appcat</code>, <code>apprisk</code>, and for UTM logs <code>level</code>, <code>applist</code>, <code>msg</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Five groups of fields">
<rect x="8" y="30" width="118" height="70" rx="8" fill="#e2e8f0"/><text x="67" y="58" text-anchor="middle" class="svg-ink" font-size="13">Device, time</text><text x="67" y="80" text-anchor="middle" class="svg-muted" font-size="12">devname itime</text>
<rect x="134" y="30" width="118" height="70" rx="8" fill="#bae6fd"/><text x="193" y="58" text-anchor="middle" class="svg-ink" font-size="13">Who</text><text x="193" y="80" text-anchor="middle" class="svg-muted" font-size="12">srcip srcport</text>
<rect x="260" y="30" width="118" height="70" rx="8" fill="#bbf7d0"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="13">To where</text><text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">dstip dstport</text>
<rect x="386" y="30" width="118" height="70" rx="8" fill="#fde68a"/><text x="445" y="58" text-anchor="middle" class="svg-ink" font-size="13">Decision</text><text x="445" y="80" text-anchor="middle" class="svg-muted" font-size="12">action policyid</text>
<rect x="512" y="30" width="118" height="70" rx="8" fill="#ddd6fe"/><text x="571" y="58" text-anchor="middle" class="svg-ink" font-size="13">What</text><text x="571" y="80" text-anchor="middle" class="svg-muted" font-size="12">app appcat</text>
</svg><p class="cap">Read a log in five groups instead of one long line.</p></div>

<h3>Step 2: the fields in a table</h3>
<table class="cmp"><tr><th>Field</th><th>Meaning</th><th>Example</th></tr>
<tr><td>srcip, dstip</td><td>Source and destination address before NAT</td><td>10.20.0.10 to 192.0.2.80</td></tr>
<tr><td>dstport, service</td><td>Destination port and the service object that matched</td><td>6881, ALL</td></tr>
<tr><td>action</td><td>What the policy did: accept or deny (UTM logs: block)</td><td>accept</td></tr>
<tr><td>utmaction</td><td>Verdict of the security profiles on a traffic log</td><td>block</td></tr>
<tr><td>policyid, policyname</td><td>The firewall policy that decided</td><td>1, LAN-TO-WAN</td></tr>
<tr><td>app, appcat</td><td>Application and its category (application control)</td><td>BitTorrent, P2P</td></tr>
<tr><td>level</td><td>Severity of the log</td><td>notice, warning</td></tr>
<tr><td>devname</td><td>The FortiGate that wrote it</td><td>MDU-FGT</td></tr>
<tr><td>itime</td><td>Time the FortiAnalyzer received the log</td><td>1791838209</td></tr></table>

<h3>Step 3: two times, two meanings</h3>
<p><code>date</code> and <code>time</code> are written by the FortiGate when the session happened. <code>itime</code> is the <b>receive time</b>, a number of seconds since 1 January 1970 (a Unix timestamp), set by the FortiAnalyzer when the log arrived. Normally they are a second apart. When a FortiGate batches its logs the gap grows, and that gap is how you prove a log was late (chapter 5).</p>

<h3>Why it matters</h3>
<p>Most tickets are answered by four fields: srcip (who), dstip and dstport (where), action and utmaction (what happened), policyid (which rule). If you can pick these out in ten seconds you can answer a helpdesk in minutes.</p>

<div class="eg"><p><b>Worked example.</b> A real traffic log of MDU-FGT, shortened:</p></div>
<pre class="out">devname="MDU-FGT" type="traffic" subtype="forward" level="notice"
srcip=10.20.0.10 srcport=53376 srcintf="port2" dstip=192.0.2.80 dstport=6881 dstintf="port1"
sessionid=9081 policyid=1 policyname="LAN-TO-WAN" service="ALL"
trandisp="snat" transip=192.0.2.12 sentbyte=84
<span class="hl">action="accept" utmaction="block"</span> app="BitTorrent" appcat="P2P" apprisk="critical"</pre>
<p>Read it: MDU-FGT, a PC at 10.20.0.10 inside Madurai, opened a connection to the intranet server on port 6881. Policy 1, LAN-TO-WAN, accepted the session, source NAT changed the source to 192.0.2.12 (<code>transip</code>), and the security profiles then blocked it: the application was BitTorrent, category P2P, risk critical.</p>
<p>Simulator notes: <code>sentbyte=84</code> is a stand-in value, <code>user</code> stays empty, duration is 0, and the action is always accept or deny.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading <code>action=accept</code> as "it worked" and ignoring <code>utmaction</code>; searching for the NAT address in <code>srcip</code> (srcip is the original address, <code>transip</code> is the translated one); confusing policyid (a number) with policyname (a label); comparing date and time across two FortiGates that have different clocks.</p></div>

<div class="exam"><p><b>Exam traps.</b> action in a traffic log is the policy result, utmaction is the profile result. policyid identifies the rule that decided, which is why logs prove which rule matched. itime is the FortiAnalyzer receive time, not the event time. The level of traffic logs is notice.</p></div>

<div class="scn"><h4>Two clocks, one argument</h4><p>A branch engineer insisted that a log at 10:02 could not be about his 10:05 download. The analyst compared <code>time</code> with <code>itime</code> and saw that the FortiGate clock was three minutes behind. The log was his session after all, and the fix was to correct the clock of the FortiGate.</p><p><b>Lesson:</b> know which time you are reading before you compare it with a complaint.</p></div>

<div class="iv"><p class="q">"A user says the firewall blocked a site. Which log fields do you read first?"</p><p>srcip to confirm the user, dstip and dstport for the destination, action and utmaction for the decision, policyid for the rule, and app or hostname for what it was. Then check devname so you look at the right FortiGate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read a log in five groups: device and time, who, to where, decision, what.</li>
<li>action is the policy result; utmaction and the UTM action are the profile result.</li>
<li>srcip is before NAT; transip is the translated address.</li>
<li>policyid and policyname tell you which rule decided.</li>
<li>itime is the FortiAnalyzer receive time; date and time come from the FortiGate.</li>
</ul></div>
`,hi:`
<p>Parcel label batata hai ki kisne bheja, kisko milega, kaun si courier ne handle kiya, deliver hua ya refuse, aur kab. Firewall log bilkul aisa hi label hai, bas zyada boxes ke saath. Beginners aksar key=value pairs ki ek lambi line ko dekhkar haar maan lete hain. Trick ye hai ki use paanch groups mein padho, aur wo dozen-bhar fields seekho jo lagbhag har ticket ka jawab dete hain.</p>

<h3>Step 1: paanch groups</h3>
<p>Har log <b>fields</b> ki list hai. Field ek name aur value hai jo <code>name=value</code> likhi jaati hai. Inhe is order mein padho:</p>
<ol>
<li><b>Kaun sa device aur kab:</b> <code>devname</code>, <code>devid</code> (serial number), <code>date</code>, <code>time</code> aur <code>itime</code>.</li>
<li><b>Kaun:</b> <code>srcip</code>, <code>srcport</code>, <code>srcintf</code>.</li>
<li><b>Kahan:</b> <code>dstip</code>, <code>dstport</code>, <code>dstintf</code>, <code>service</code>, <code>proto</code>.</li>
<li><b>Decision:</b> <code>action</code>, <code>utmaction</code>, <code>policyid</code>, <code>policyname</code>.</li>
<li><b>Wo kya tha:</b> <code>app</code>, <code>appcat</code>, <code>apprisk</code>, aur UTM logs mein <code>level</code>, <code>applist</code>, <code>msg</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Fields ke paanch groups">
<rect x="8" y="30" width="118" height="70" rx="8" fill="#e2e8f0"/><text x="67" y="58" text-anchor="middle" class="svg-ink" font-size="13">Device, time</text><text x="67" y="80" text-anchor="middle" class="svg-muted" font-size="12">devname itime</text>
<rect x="134" y="30" width="118" height="70" rx="8" fill="#bae6fd"/><text x="193" y="58" text-anchor="middle" class="svg-ink" font-size="13">Kaun</text><text x="193" y="80" text-anchor="middle" class="svg-muted" font-size="12">srcip srcport</text>
<rect x="260" y="30" width="118" height="70" rx="8" fill="#bbf7d0"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="13">Kahan</text><text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">dstip dstport</text>
<rect x="386" y="30" width="118" height="70" rx="8" fill="#fde68a"/><text x="445" y="58" text-anchor="middle" class="svg-ink" font-size="13">Decision</text><text x="445" y="80" text-anchor="middle" class="svg-muted" font-size="12">action policyid</text>
<rect x="512" y="30" width="118" height="70" rx="8" fill="#ddd6fe"/><text x="571" y="58" text-anchor="middle" class="svg-ink" font-size="13">Kya tha</text><text x="571" y="80" text-anchor="middle" class="svg-muted" font-size="12">app appcat</text>
</svg><p class="cap">Log ko ek lambi line ki jagah paanch groups mein padho.</p></div>

<h3>Step 2: fields ek table mein</h3>
<table class="cmp"><tr><th>Field</th><th>Matlab</th><th>Example</th></tr>
<tr><td>srcip, dstip</td><td>NAT se pehle ka source aur destination address</td><td>10.20.0.10 to 192.0.2.80</td></tr>
<tr><td>dstport, service</td><td>Destination port aur jo service object match hua</td><td>6881, ALL</td></tr>
<tr><td>action</td><td>Policy ne kya kiya: accept ya deny (UTM logs: block)</td><td>accept</td></tr>
<tr><td>utmaction</td><td>Traffic log par security profiles ka verdict</td><td>block</td></tr>
<tr><td>policyid, policyname</td><td>Jis firewall policy ne decide kiya</td><td>1, LAN-TO-WAN</td></tr>
<tr><td>app, appcat</td><td>Application aur uski category (application control)</td><td>BitTorrent, P2P</td></tr>
<tr><td>level</td><td>Log ki severity</td><td>notice, warning</td></tr>
<tr><td>devname</td><td>Jis FortiGate ne likha</td><td>MDU-FGT</td></tr>
<tr><td>itime</td><td>Jab FortiAnalyzer ne log receive kiya</td><td>1791838209</td></tr></table>

<h3>Step 3: do times, do matlab</h3>
<p><code>date</code> aur <code>time</code> FortiGate likhta hai jab session hua. <code>itime</code> <b>receive time</b> hai, 1 January 1970 se seconds ki ginti (Unix timestamp), jo FortiAnalyzer set karta hai jab log aaya. Normally dono mein ek second ka farak hota hai. Jab FortiGate logs ko batch karta hai to gap badhta hai, aur wahi gap prove karta hai ki log late tha (chapter 5).</p>

<h3>Yeh kyun zaroori hai</h3>
<p>Zyaadatar tickets chaar fields se solve hote hain: srcip (kaun), dstip aur dstport (kahan), action aur utmaction (kya hua), policyid (kaun sa rule). Agar aap ye dus second mein pehchaan lo to helpdesk ko minutes mein jawab de sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> MDU-FGT ka ek real traffic log, shortened:</p></div>
<pre class="out">devname="MDU-FGT" type="traffic" subtype="forward" level="notice"
srcip=10.20.0.10 srcport=53376 srcintf="port2" dstip=192.0.2.80 dstport=6881 dstintf="port1"
sessionid=9081 policyid=1 policyname="LAN-TO-WAN" service="ALL"
trandisp="snat" transip=192.0.2.12 sentbyte=84
<span class="hl">action="accept" utmaction="block"</span> app="BitTorrent" appcat="P2P" apprisk="critical"</pre>
<p>Ise padho: MDU-FGT, Madurai ke andar 10.20.0.10 ke PC ne intranet server ko port 6881 par connection kholi. Policy 1, LAN-TO-WAN, ne session accept kiya, source NAT ne source 192.0.2.12 kar diya (<code>transip</code>), aur phir security profiles ne use block kiya: application BitTorrent, category P2P, risk critical.</p>
<p>Simulator notes: <code>sentbyte=84</code> ek stand-in value hai, <code>user</code> khaali rehta hai, duration 0 hai, aur action hamesha accept ya deny hota hai.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>action=accept</code> ko "chal gaya" padhna aur <code>utmaction</code> ignore karna; NAT address ko <code>srcip</code> mein search karna (srcip original address hai, <code>transip</code> translated hai); policyid (number) aur policyname (label) ko confuse karna; do alag FortiGates ke date aur time compare karna jinki clocks alag hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Traffic log mein action policy ka result hai, utmaction profile ka result. policyid us rule ko identify karta hai jisne decide kiya, isliye logs prove karte hain ki kaun sa rule match hua. itime FortiAnalyzer ka receive time hai, event time nahi. Traffic logs ka level notice hota hai.</p></div>

<div class="scn"><h4>Do clocks, ek behas</h4><p>Ek branch engineer ka kehna tha ki 10:02 ka log uski 10:05 ki download ka nahi ho sakta. Analyst ne <code>time</code> ko <code>itime</code> se compare kiya aur dekha ki FortiGate ki clock teen minute peeche thi. Log aakhir uska hi session tha, aur fix ye tha ki FortiGate ki clock sahi ki jaye.</p><p><b>Lesson:</b> complaint se compare karne se pehle jaano ki aap kaun sa time padh rahe ho.</p></div>

<div class="iv"><p class="q">"User kehta hai firewall ne site block ki. Aap pehle kaun se log fields padhte ho?"</p><p>srcip se user confirm, dstip aur dstport se destination, action aur utmaction se decision, policyid se rule, aur app ya hostname se wo kya tha. Phir devname check karo taaki sahi FortiGate dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log ko paanch groups mein padho: device aur time, kaun, kahan, decision, kya.</li>
<li>action policy ka result hai; utmaction aur UTM action profile ka result hai.</li>
<li>srcip NAT se pehle ka hai; transip translated address hai.</li>
<li>policyid aur policyname batate hain kaun sa rule decide kiya.</li>
<li>itime FortiAnalyzer ka receive time hai; date aur time FortiGate se aate hain.</li>
</ul></div>
`}};export{e as default};