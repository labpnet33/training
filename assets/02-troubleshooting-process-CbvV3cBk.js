var e={id:`troubleshooting-process`,h:{en:`Troubleshooting as a process`,hi:`Process ki tarah troubleshooting`},body:{en:`
<p>A car mechanic hears "it makes a noise". An impatient mechanic replaces the part that was faulty on the last car he fixed. A good mechanic asks when the noise happens (only when braking? only when cold?), drives the car, listens, lifts it, and checks one system at a time. If the brake pads are fine, he crosses brakes off the list and moves on. Troubleshooting a network works the same way. This chapter turns that habit into a written process you can follow under pressure.</p>

<h3>Shoot-from-the-hip versus structured</h3>
<p>There are two broad styles of troubleshooting.</p>
<dl class="terms">
<dt>Shoot-from-the-hip</dt><dd>You jump straight to the likely cause based on experience: "branch cannot reach the server, it must be the ACL again". When the hunch is right it is very fast. When it is wrong you waste time, you may change things that were fine, and you learn nothing about why the network failed.</dd>
<dt>Structured troubleshooting</dt><dd>You follow defined steps: define the problem, collect facts, and narrow the causes systematically until one remains. It is slower on easy problems but it finishes on hard problems, and anyone else can follow and check your reasoning.</dd>
</dl>
<p>Experienced engineers blend the two. They allow themselves one quick, <b>read-only</b> check of their hunch, time-boxed to a few minutes. If the hunch is not confirmed, they switch to the structured process at once instead of chasing a second and third hunch.</p>

<h3>The generic troubleshooting process</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Generic troubleshooting process">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">1 Define problem</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="12">2 Gather info</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="12">3 Analyse</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">4 Eliminate</text>
<rect x="490" y="110" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="137" text-anchor="middle" class="svg-ink" font-size="12">5 Propose hypothesis</text>
<rect x="330" y="110" width="140" height="44" rx="8" fill="#fde68a"/><text x="400" y="137" text-anchor="middle" class="svg-ink" font-size="12">6 Test hypothesis</text>
<rect x="170" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="240" y="137" text-anchor="middle" class="svg-ink" font-size="12">7 Solve</text>
<rect x="10" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="137" text-anchor="middle" class="svg-ink" font-size="12">8 Document</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="560" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="132" x2="470" y2="132" stroke="#64748b" stroke-width="2"/><line x1="330" y1="132" x2="310" y2="132" stroke="#64748b" stroke-width="2"/><line x1="170" y1="132" x2="150" y2="132" stroke="#64748b" stroke-width="2"/>
<path d="M400 154 L400 190 L240 190 L240 64" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="400" y="212" text-anchor="middle" class="svg-accent" font-size="12">hypothesis wrong: roll back, gather more, try again</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">Steps 1 and 8 are the ones people skip, and the ones that matter most later</text>
</svg><p class="cap">The generic process. A disproved hypothesis loops back to gathering more information, never to random changes.</p></div>

<ol>
<li><b>Define the problem.</b> A user report is a symptom, often with a wrong diagnosis attached ("the internet is down"). Turn it into a precise statement: who is affected, what exactly fails, from where to where, since when, always or intermittently, and <b>what changed</b>.</li>
<li><b>Gather information.</b> Collect show output, logs, monitoring graphs, the change record and the topology. Make sure you have access to every device in the path before you need it.</li>
<li><b>Analyse the information.</b> Compare what you see with how the network should work: your knowledge of the protocols and your <b>baseline</b> (normal state recorded when all was well).</li>
<li><b>Eliminate potential causes.</b> Cross off what the facts prove is working. If PC1 can ping SRV1 but HTTPS fails, Layer 1 to Layer 3 along the path are proven good for that flow.</li>
<li><b>Propose a hypothesis.</b> From what remains, pick the most likely cause, and if two are equally likely, the one that is cheaper to test.</li>
<li><b>Test the hypothesis.</b> Prefer a read-only test (a show command, a packet capture). If the test is a change, make one change at a time and know how to roll it back. If the hypothesis is disproved, roll back and return to gathering.</li>
<li><b>Solve the problem.</b> Apply the fix, then verify from the user's point of view, not only the router's, and check you did not break anything else.</li>
<li><b>Document.</b> Record symptom, root cause, fix, verification and how to prevent it. Update the baseline and diagrams if they changed.</li>
</ol>

<div class="eg"><p><b>Worked example: defining a problem.</b> The ticket says: "Branch cannot reach the intranet." After five questions it becomes: "Since 09:40 today, all users in 10.1.10.0/24 (behind R1) cannot open HTTPS to SRV1 10.3.30.10. Ping from PC1 to SRV1 works. Users in other branches are not affected. Change CHG-2231 on R3 was implemented at 09:35." That single sentence already eliminates the physical path, the routing between PC1 and SRV1, and every other branch. The obvious place to look is the change on R3, and the likely suspect is something that treats TCP differently from ICMP, such as an ACL.</p></div>

<h3>Gathering evidence of change</h3>
<p>"What changed" is the most powerful question in troubleshooting, so make IOS answer it for you. The configuration change logger records every configuration command with the user and line:</p>
<pre class="code"><span class="c">! Log every configuration command, send it to syslog, hide passwords</span>
R3(config)# archive
R3(config-archive)# log config
R3(config-archive-log-cfg)# logging enable
R3(config-archive-log-cfg)# notify syslog contenttype plaintext
R3(config-archive-log-cfg)# hidekeys</pre>
<pre class="out">R3# show archive log config all
 idx   sess           user@line      Logged command
    1     1        netops@vty0     |ip access-list extended SRV-PROTECT
    2     1        netops@vty0     | permit icmp any any
    3     1        netops@vty0     | permit tcp any any eq 22
    4     1        netops@vty0     | deny ip any any log
<span class="hl">    5     1        netops@vty0     |interface GigabitEthernet0/2</span>
<span class="hl">    6     1        netops@vty0     | ip access-group SRV-PROTECT out</span></pre>
<p>Here the evidence shows that at CHG-2231 an outbound ACL was applied toward SRV1 that allows only ICMP and SSH. HTTPS (TCP 443) is denied. The hypothesis is confirmed with a read-only command before any change is made.</p>

<div class="warn"><p><b>Common mistake.</b> Changing several things at once "to save time". If the problem goes away you do not know which change fixed it, and one of the other changes may have created a new problem that appears next week. One change, one test, and roll back if the test fails.</p></div>

<div class="exam"><p><b>Exam trap.</b> Drag-and-drop items ask for the order of the steps. "Eliminate potential causes" comes <b>before</b> "propose a hypothesis", and "document" is the last step, after the solution is verified. Also remember that the process loops back to gathering information when a hypothesis fails.</p></div>

<div class="scn"><h4>The reload that erased the evidence</h4><p>A distribution router started dropping OSPF adjacencies every few minutes. The on-call engineer suspected a software bug and reloaded the router. The flapping stopped for two hours and then returned. Because the router had only a small console log buffer and no syslog server, the logs from before the reload were gone. The second time, a senior engineer first captured <code>show logging</code>, <code>show processes cpu sorted</code> and <code>show interfaces</code>, which showed input errors and a duplex mismatch on one uplink after a patch-panel move. Fixing the duplex setting solved it for good.</p><p><b>Lesson:</b> gather information before you act, especially before a reload, which destroys evidence.</p></div>

<div class="iv"><p class="q">"What is the difference between shoot-from-the-hip and structured troubleshooting, and which do you use?"</p><p>Explain both honestly: shoot-from-the-hip uses experience to jump to a likely cause and is fast when right; structured follows define, gather, analyse, eliminate, hypothesise, test, solve, document and succeeds on unfamiliar problems. Say that you allow a short, read-only check of your hunch and then fall back to the structured process, and that you always document root cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shoot-from-the-hip is fast when right but unreliable; structured troubleshooting finishes on hard problems.</li>
<li>The eight steps: define, gather, analyse, eliminate, propose hypothesis, test, solve, document.</li>
<li>A precise problem statement (who, what, where, since when, what changed) eliminates most causes before you touch a device.</li>
<li>Test hypotheses read-only where possible; otherwise one change at a time with a rollback plan.</li>
<li>Use the configuration change logger (<code>archive</code> / <code>log config</code>) so "what changed" has an answer.</li>
</ul></div>
`,hi:`
<p>Ek car mechanic sunta hai "gaadi se awaaz aati hai". Jaldbaaz mechanic woh part badal deta hai jo pichhli gaadi mein kharab tha. Achha mechanic poochta hai ki awaaz kab aati hai (sirf brake lagane par? sirf thandi gaadi mein?), gaadi chalata hai, sunta hai, use uthata hai, aur ek baar mein ek system check karta hai. Agar brake pads theek hain, to woh brakes list se kaat deta hai aur aage badhta hai. Network troubleshooting bilkul aise hi kaam karti hai. Yeh chapter us aadat ko ek likhe hue process mein badalta hai jo aap pressure mein bhi follow kar sako.</p>

<h3>Shoot-from-the-hip versus structured</h3>
<p>Troubleshooting ke do broad styles hain.</p>
<dl class="terms">
<dt>Shoot-from-the-hip</dt><dd>Aap experience ke basis par seedha likely cause par koodte ho: "branch server tak nahi pahunch rahi, phir se ACL hi hoga". Jab hunch sahi ho to yeh bahut tez hai. Jab galat ho to time barbaad hota hai, aap aisi cheezein badal sakte ho jo theek thi, aur aap yeh bilkul nahi seekhte ki network kyun fail hua.</dd>
<dt>Structured troubleshooting</dt><dd>Aap defined steps follow karte ho: problem define karo, facts collect karo, aur causes ko systematically tab tak kam karo jab tak ek bache. Aasaan problems par yeh dheema hai par mushkil problems par khatam hota hai, aur koi bhi doosra aapki reasoning follow aur check kar sakta hai.</dd>
</dl>
<p>Experienced engineers dono ko milate hain. Woh apne hunch ka ek jaldi, <b>read-only</b> check karne dete hain, kuch minutes tak time-boxed. Agar hunch confirm nahi hota, to woh doosre aur teesre hunch ke peeche bhaagne ki jagah turant structured process par switch kar lete hain.</p>

<h3>Generic troubleshooting process</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Generic troubleshooting process">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">1 Problem define</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="12">2 Info gather</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="12">3 Analyse</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">4 Eliminate</text>
<rect x="490" y="110" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="137" text-anchor="middle" class="svg-ink" font-size="12">5 Hypothesis do</text>
<rect x="330" y="110" width="140" height="44" rx="8" fill="#fde68a"/><text x="400" y="137" text-anchor="middle" class="svg-ink" font-size="12">6 Hypothesis test</text>
<rect x="170" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="240" y="137" text-anchor="middle" class="svg-ink" font-size="12">7 Solve</text>
<rect x="10" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="137" text-anchor="middle" class="svg-ink" font-size="12">8 Document</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="560" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="132" x2="470" y2="132" stroke="#64748b" stroke-width="2"/><line x1="330" y1="132" x2="310" y2="132" stroke="#64748b" stroke-width="2"/><line x1="170" y1="132" x2="150" y2="132" stroke="#64748b" stroke-width="2"/>
<path d="M400 154 L400 190 L240 190 L240 64" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="400" y="212" text-anchor="middle" class="svg-accent" font-size="12">hypothesis galat: roll back, aur info lo, phir try karo</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">Steps 1 aur 8 log chhod dete hain, aur baad mein wahi sabse zyada matter karte hain</text>
</svg><p class="cap">Generic process. Galat sabit hua hypothesis wapas information gather karne par jaata hai, kabhi random changes par nahi.</p></div>

<ol>
<li><b>Problem define karo.</b> User report ek symptom hai, aksar galat diagnosis ke saath ("internet down hai"). Use ek precise statement mein badlo: kaun affected hai, exactly kya fail hota hai, kahan se kahan tak, kab se, hamesha ya beech beech mein, aur <b>kya badla</b>.</li>
<li><b>Information gather karo.</b> Show output, logs, monitoring graphs, change record aur topology collect karo. Zaroorat padne se pehle pakka karo ki path ke har device ka access aapke paas hai.</li>
<li><b>Information analyse karo.</b> Jo dikh raha hai use network ke sahi behaviour se compare karo: protocols ka aapka knowledge aur aapki <b>baseline</b> (sab theek hone par record ki gayi normal state).</li>
<li><b>Potential causes eliminate karo.</b> Jo facts se working sabit ho, use kaat do. Agar PC1 SRV1 ko ping kar sakta hai par HTTPS fail hota hai, to us flow ke liye path par Layer 1 se Layer 3 tak sab theek sabit hai.</li>
<li><b>Hypothesis propose karo.</b> Jo bacha hai usmein se sabse likely cause chuno, aur agar do barabar likely hon, to woh jise test karna sasta ho.</li>
<li><b>Hypothesis test karo.</b> Read-only test prefer karo (show command, packet capture). Agar test ek change hai, to ek baar mein ek change karo aur roll back karna aana chahiye. Agar hypothesis galat nikle, to roll back karo aur gathering par wapas jao.</li>
<li><b>Problem solve karo.</b> Fix lagao, phir sirf router ke nahi, user ke point of view se verify karo, aur check karo ki kuch aur nahi toota.</li>
<li><b>Document karo.</b> Symptom, root cause, fix, verification aur ise rokne ka tarika record karo. Agar baseline aur diagrams badle hain to unhe update karo.</li>
</ol>

<div class="eg"><p><b>Worked example: problem define karna.</b> Ticket kehta hai: "Branch intranet tak nahi pahunch rahi." Paanch sawaalon ke baad yeh banta hai: "Aaj 09:40 se, 10.1.10.0/24 (R1 ke peeche) ke saare users SRV1 10.3.30.10 par HTTPS nahi khol pa rahe. PC1 se SRV1 tak ping chalta hai. Doosri branches ke users affected nahi hain. R3 par change CHG-2231 09:35 par implement hua tha." Wahi ek sentence physical path, PC1 aur SRV1 ke beech routing, aur har doosri branch ko pehle hi eliminate kar deta hai. Dekhne ki obvious jagah R3 par hua change hai, aur likely suspect aisi cheez hai jo TCP ko ICMP se alag treat karti hai, jaise ACL.</p></div>

<h3>Change ka saboot gather karna</h3>
<p>"Kya badla" troubleshooting ka sabse powerful sawaal hai, isliye IOS se iska jawab dilwao. Configuration change logger har configuration command ko user aur line ke saath record karta hai:</p>
<pre class="code"><span class="c">! Har configuration command log karo, syslog par bhejo, passwords chhupao</span>
R3(config)# archive
R3(config-archive)# log config
R3(config-archive-log-cfg)# logging enable
R3(config-archive-log-cfg)# notify syslog contenttype plaintext
R3(config-archive-log-cfg)# hidekeys</pre>
<pre class="out">R3# show archive log config all
 idx   sess           user@line      Logged command
    1     1        netops@vty0     |ip access-list extended SRV-PROTECT
    2     1        netops@vty0     | permit icmp any any
    3     1        netops@vty0     | permit tcp any any eq 22
    4     1        netops@vty0     | deny ip any any log
<span class="hl">    5     1        netops@vty0     |interface GigabitEthernet0/2</span>
<span class="hl">    6     1        netops@vty0     | ip access-group SRV-PROTECT out</span></pre>
<p>Yahan saboot dikhata hai ki CHG-2231 mein SRV1 ki taraf ek outbound ACL lagaya gaya jo sirf ICMP aur SSH allow karta hai. HTTPS (TCP 443) deny hai. Koi bhi change karne se pehle hypothesis ek read-only command se confirm ho gaya.</p>

<div class="warn"><p><b>Common galti.</b> "Time bachane" ke liye ek saath kai cheezein badalna. Agar problem chali jaaye to aapko pata nahi chalta ki kis change ne theek kiya, aur baaki changes mein se koi ek nayi problem bana sakta hai jo agle hafte dikhe. Ek change, ek test, aur test fail ho to roll back.</p></div>

<div class="exam"><p><b>Exam trap.</b> Drag-and-drop items steps ka order poochte hain. "Eliminate potential causes" "propose a hypothesis" se <b>pehle</b> aata hai, aur "document" aakhri step hai, solution verify hone ke baad. Yeh bhi yaad rakho ki hypothesis fail hone par process information gather karne par wapas jaata hai.</p></div>

<div class="scn"><h4>Woh reload jisne saboot mita diya</h4><p>Ek distribution router har kuch minute mein OSPF adjacencies drop karne laga. On-call engineer ko software bug ka shak hua aur usne router reload kar diya. Flapping do ghante ke liye ruki aur phir wapas aa gayi. Router mein sirf chhota console log buffer tha aur koi syslog server nahi tha, isliye reload se pehle ke logs gayab ho gaye. Doosri baar ek senior engineer ne pehle <code>show logging</code>, <code>show processes cpu sorted</code> aur <code>show interfaces</code> capture kiye, jisse ek patch-panel move ke baad ek uplink par input errors aur duplex mismatch dikha. Duplex setting theek karne se problem hamesha ke liye solve ho gayi.</p><p><b>Seekh:</b> action lene se pehle information gather karo, khaaskar reload se pehle, jo saboot mita deta hai.</p></div>

<div class="iv"><p class="q">"Shoot-from-the-hip aur structured troubleshooting mein kya fark hai, aur aap kaunsa use karte ho?"</p><p>Dono ko imaandari se samjhao: shoot-from-the-hip experience se likely cause par koodta hai aur sahi hone par tez hai; structured define, gather, analyse, eliminate, hypothesise, test, solve, document follow karta hai aur anjaan problems par safal hota hai. Batao ki aap apne hunch ka chhota, read-only check karte ho aur phir structured process par aa jaate ho, aur hamesha root cause document karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shoot-from-the-hip sahi hone par tez hai par bharosemand nahi; structured troubleshooting mushkil problems par khatam hoti hai.</li>
<li>Aath steps: define, gather, analyse, eliminate, hypothesis propose, test, solve, document.</li>
<li>Precise problem statement (kaun, kya, kahan, kab se, kya badla) device chhune se pehle hi zyada tar causes eliminate kar deta hai.</li>
<li>Jahan ho sake hypothesis read-only test karo; warna rollback plan ke saath ek baar mein ek change.</li>
<li>Configuration change logger (<code>archive</code> / <code>log config</code>) use karo taaki "kya badla" ka jawab mile.</li>
</ul></div>
`}};export{e as default};