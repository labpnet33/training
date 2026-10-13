var e={id:`designing-handlers`,h:{en:`Designing handlers that fire: real field values and sensible thresholds`,hi:`Aise handlers banana jo fire hon: real field values aur sahi thresholds`},body:{en:`
<p>If you ask a shopkeeper to ring a bell "when a customer is angry", the bell never rings, because "angry" is not something the shop records. If you say "when three customers ask for a refund in ten minutes", the bell can ring, because refunds are written in a book. A handler has the same rule: it can only count what the logs really contain, in the words the logs really use. Most handlers that "never fire" were written from memory instead of from the logs.</p>

<h3>Step 1: read the logs before you write the filter</h3>
<p>Always open Log View on the traffic you want to catch and copy the field and value exactly. The most common surprise is the word for a blocked session. A traffic log written by the firewall for a session stopped by a deny policy holds <code>action="deny"</code>. It does not hold "blocked", "drop" or "block". Test the filter in Log View first, because the handler filter uses the same <code>field=value</code> form.</p>
<pre class="out">FAZ-1 # execute fazui logview root - traffic action=<span class="hl">blocked</span>
0 logs match, 0 shown (newest first).

FAZ-1 # execute fazui logview root - traffic action=<span class="hl">deny</span> limit 1
6 logs match, 1 shown (newest first).
1: ... srcip=10.20.0.10 ... dstip=192.0.2.80 dstport=80 ... action="deny" policyid=5 policyname="DENY-WEB" ...</pre>
<p>Zero matches in Log View means zero events from a handler with the same filter, always. If the search shows nothing, fix the filter before you touch the threshold.</p>

<h3>Step 2: know which log type holds your field</h3>
<p>A session that a policy accepts and a security profile then stops is logged differently from a session that a policy denies. The traffic log of such a session says <code>action="accept"</code> and <code>utmaction="block"</code>, and a second log of type utm holds the verdict with <code>action="block"</code>. So "blocked sessions" can mean two different filters.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two kinds of blocked">
<rect x="20" y="20" width="290" height="110" rx="8" fill="#fed7aa"/><text x="165" y="46" text-anchor="middle" class="svg-ink" font-size="13">Policy says deny</text>
<text x="165" y="72" text-anchor="middle" class="svg-muted" font-size="12">traffic log, policyname DENY-WEB</text><text x="165" y="96" text-anchor="middle" class="svg-accent" font-size="13">action=deny</text>
<rect x="330" y="20" width="290" height="110" rx="8" fill="#ddd6fe"/><text x="475" y="46" text-anchor="middle" class="svg-ink" font-size="13">Profile stops an accepted session</text>
<text x="475" y="72" text-anchor="middle" class="svg-muted" font-size="12">traffic: action=accept</text><text x="475" y="96" text-anchor="middle" class="svg-accent" font-size="13">utmaction=block, utm log action=block</text>
<text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">Choose the log type and field that match your ticket.</text>
</svg><p class="cap">"Blocked" is not one value.</p></div>

<h3>Step 3: choose threshold and window from normal behaviour</h3>
<p>Ask first how often the pattern happens when everything is normal, then place the threshold clearly above that. A threshold of 1 on denied traffic raises an event for every single denied session, which is noise. A threshold of 100 in 1 minute may never be reached by a branch with ten users. A window of 5 minutes with threshold 3 means "three attempts, quickly", which is a pattern a human would also call suspicious.</p>
<div class="eg"><p><b>Worked example.</b> During the project freeze, a user at head office may refresh the blocked intranet page once or twice by habit. The SOC lead looks at Log View for the last day: most sources have one or two denied logs, one source has fifteen. She sets threshold 3 in 5 minutes with group-by srcip. Normal habit stays below the line, a stuck script or a curious user crosses it, and each source is counted on its own.</p></div>

<h3>Step 4: group, scope and severity</h3>
<table class="cmp"><tr><th>Decision</th><th>Guidance</th></tr>
<tr><td>Group-by</td><td>Use srcip when the question is "which machine keeps trying". Use dstip for "what is being hit", policyid for "which rule is busy". No group-by only when you want the total.</td></tr>
<tr><td>Device</td><td>Name a device only when the rule belongs to one site. Without it, one handler covers every device of the ADOM and its events show which device it was.</td></tr>
<tr><td>Severity</td><td>Reserve high and critical for patterns where a person must act. If everything is high, nothing is.</td></tr>
<tr><td>Type</td><td>Traffic for sessions, utm for security profile verdicts, event for configuration changes of the FortiGates.</td></tr>
</table>
<pre class="code"><span class="c">! three designs for Kaveri Retail, on FAZ-1</span>
execute fazui handler create root deny-burst traffic action=deny group-by=srcip 3 5 high
execute fazui handler create root p2p-use utm app=BitTorrent group-by=srcip 2 5 medium
execute fazui handler create root policy-edit event cfgpath=firewall.policy 1 5 low</pre>
<p>The third handler reads the synthetic event logs that the simulated FortiGate writes for configuration changes. A threshold of 1 is reasonable there because policy edits are rare and every one deserves a look.</p>

<div class="warn"><p><b>Common mistakes.</b> Writing "blocked" or "denied" from memory; filtering a traffic log on a UTM field or the other way round; copying a handler from a book without checking that your devices produce the field; setting the same severity on every handler; a window so short that the threshold is physically unreachable.</p></div>

<div class="exam"><p><b>Exam trap.</b> Handler filters use the field names and values of the stored logs. The value for a policy deny in a traffic log is <code>deny</code>. In the simulator the action of a traffic log is only accept or deny; words such as close or client-rst do not appear.</p></div>

<div class="scn"><h4>The handler that waited for a word that never came</h4><p>A new analyst at Kaveri wrote a handler with the filter <code>action=blocked</code> because that is what the sentence in the ticket said. Over a whole week the SOC board stayed empty, and the manager read it as proof that the network was clean. A colleague ran the same filter in Log View and got zero logs, then removed the filter and saw action=deny in every refused session. After the filter was corrected, the handler fired the same afternoon.</p><p><b>Lesson:</b> test the filter in Log View before you trust a handler. Empty boards need proof, not hope.</p></div>

<div class="iv"><p class="q">"How do you decide the threshold and the group-by of a new handler?"</p><p>I read the real logs first, learn the normal rate for the pattern, set the threshold clearly above it, and choose group-by for what counts as the same thing, usually the source address. I confirm the filter in Log View and then test the handler with generated traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Write the filter from the real log fields; a policy deny is action=deny, not blocked.</li>
<li>Test the same filter in Log View first; zero matches there means zero events.</li>
<li>Policy denies and profile blocks are different log types and fields.</li>
<li>Choose the threshold from normal behaviour and group-by for what counts as the same thing.</li>
<li>Keep severities meaningful so the board stays useful.</li>
</ul></div>
`,hi:`
<p>Agar aap dukaandar se kaho "jab customer gussa ho tab ghanti bajao", to ghanti kabhi nahi bajegi, kyunki "gussa" dukaan record nahi karti. Agar bolo "jab das minute mein teen customers refund maangen", to ghanti baj sakti hai, kyunki refunds register mein likhe jaate hain. Handler ka bhi yahi rule hai: wo sirf wahi gin sakta hai jo logs mein sach mein hai, un words mein jo logs sach mein use karte hain. Zyadatar handlers jo "kabhi fire nahi hote" wo logs dekhe bina, yaad se likhe gaye the.</p>

<h3>Step 1: filter likhne se pehle logs padho</h3>
<p>Jis traffic ko pakadna hai uske liye pehle Log View kholo aur field aur value bilkul waise copy karo. Sabse common surprise blocked session ka word hai. Deny policy se roke gaye session ke liye firewall jo traffic log likhta hai usmein <code>action="deny"</code> hota hai. Usmein "blocked", "drop" ya "block" nahi hota. Filter pehle Log View mein test karo, kyunki handler filter wahi <code>field=value</code> form use karta hai.</p>
<pre class="out">FAZ-1 # execute fazui logview root - traffic action=<span class="hl">blocked</span>
0 logs match, 0 shown (newest first).

FAZ-1 # execute fazui logview root - traffic action=<span class="hl">deny</span> limit 1
6 logs match, 1 shown (newest first).
1: ... srcip=10.20.0.10 ... dstip=192.0.2.80 dstport=80 ... action="deny" policyid=5 policyname="DENY-WEB" ...</pre>
<p>Log View mein zero matches ka matlab hai ki usi filter wale handler se zero events, hamesha. Agar search kuch na dikhaye, threshold ko haath lagane se pehle filter theek karo.</p>

<h3>Step 2: jaano ki aapka field kaun se log type mein hai</h3>
<p>Jo session policy accept kare aur security profile baad mein roke, wo us session se alag log hota hai jise policy deny karti hai. Aise session ka traffic log <code>action="accept"</code> aur <code>utmaction="block"</code> kehta hai, aur utm type ka doosra log verdict <code>action="block"</code> ke saath rakhta hai. Isliye "blocked sessions" ke do alag filters ho sakte hain.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Blocked ke do tarike">
<rect x="20" y="20" width="290" height="110" rx="8" fill="#fed7aa"/><text x="165" y="46" text-anchor="middle" class="svg-ink" font-size="13">Policy kehti hai deny</text>
<text x="165" y="72" text-anchor="middle" class="svg-muted" font-size="12">traffic log, policyname DENY-WEB</text><text x="165" y="96" text-anchor="middle" class="svg-accent" font-size="13">action=deny</text>
<rect x="330" y="20" width="290" height="110" rx="8" fill="#ddd6fe"/><text x="475" y="46" text-anchor="middle" class="svg-ink" font-size="13">Profile accepted session roke</text>
<text x="475" y="72" text-anchor="middle" class="svg-muted" font-size="12">traffic: action=accept</text><text x="475" y="96" text-anchor="middle" class="svg-accent" font-size="13">utmaction=block, utm log action=block</text>
<text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">Ticket ke hisaab se log type aur field chuno.</text>
</svg><p class="cap">"Blocked" ek hi value nahi hai.</p></div>

<h3>Step 3: threshold aur window normal behaviour se chuno</h3>
<p>Pehle poocho ki sab normal ho to ye pattern kitni baar hota hai, phir threshold usse saaf upar rakho. Denied traffic par threshold 1 har ek denied session ke liye event raise karta hai, jo noise hai. 1 minute mein 100 ka threshold dus users wali branch kabhi paar nahi karegi. 5 minute window aur threshold 3 ka matlab "teen koshishein, jaldi jaldi", jo pattern insaan bhi suspicious kahega.</p>
<div class="eg"><p><b>Worked example.</b> Project freeze ke dauran head office ka user aadatan blocked intranet page ek-do baar refresh kar sakta hai. SOC lead pichle din ka Log View dekhti hai: zyadatar sources ke ek-do denied logs hain, ek source ke pandrah. Wo group-by srcip ke saath 5 minute mein 3 ka threshold set karti hai. Normal aadat line ke neeche rehti hai, atka hua script ya curious user line paar karta hai, aur har source alag gina jaata hai.</p></div>

<h3>Step 4: group, scope aur severity</h3>
<table class="cmp"><tr><th>Decision</th><th>Guidance</th></tr>
<tr><td>Group-by</td><td>srcip tab jab sawal ho "kaun si machine baar-baar try kar rahi hai". dstip "kya hit ho raha hai" ke liye, policyid "kaun sa rule busy hai" ke liye. Group-by nahi, sirf jab total chahiye.</td></tr>
<tr><td>Device</td><td>Device tab do jab rule ek site ka ho. Bina device ke ek handler ADOM ke har device ko cover karta hai aur uske events batate hain ki kaun sa device tha.</td></tr>
<tr><td>Severity</td><td>High aur critical un patterns ke liye rakho jahan insaan ko action lena hai. Sab high ho to kuch bhi high nahi.</td></tr>
<tr><td>Type</td><td>Sessions ke liye traffic, security profile verdicts ke liye utm, FortiGates ke configuration changes ke liye event.</td></tr>
</table>
<pre class="code"><span class="c">! Kaveri Retail ke liye teen designs, FAZ-1 par</span>
execute fazui handler create root deny-burst traffic action=deny group-by=srcip 3 5 high
execute fazui handler create root p2p-use utm app=BitTorrent group-by=srcip 2 5 medium
execute fazui handler create root policy-edit event cfgpath=firewall.policy 1 5 low</pre>
<p>Teesra handler un synthetic event logs ko padhta hai jo simulated FortiGate configuration changes ke liye likhta hai. Wahan threshold 1 theek hai kyunki policy edits kam hote hain aur har ek dekhne laayak hai.</p>

<div class="warn"><p><b>Common mistakes.</b> "blocked" ya "denied" yaad se likhna; traffic log ko UTM field se filter karna ya ulta; kisi book se handler copy karna bina check kiye ki aapke devices wo field produce karte hain; har handler par same severity; itni chhoti window ki threshold physically reach hi na ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Handler filters stored logs ke field names aur values use karte hain. Traffic log mein policy deny ki value <code>deny</code> hai. Simulator mein traffic log ka action sirf accept ya deny hota hai; close ya client-rst jaise words nahi aate.</p></div>

<div class="scn"><h4>Handler jo ek aise word ka intezaar karta raha jo kabhi aaya hi nahi</h4><p>Kaveri ke naye analyst ne filter <code>action=blocked</code> ke saath handler likha kyunki ticket ke sentence mein yahi likha tha. Poore hafte SOC board khaali raha, aur manager ne ise network saaf hone ka saboot maan liya. Ek colleague ne wahi filter Log View mein chalaya to zero logs mile, phir filter hata kar har refused session mein action=deny dekha. Filter sahi karne ke baad handler usi dopahar fire hua.</p><p><b>Lesson:</b> handler par bharosa karne se pehle filter Log View mein test karo. Khaali board ko saboot chahiye, ummeed nahi.</p></div>

<div class="iv"><p class="q">"Naye handler ka threshold aur group-by aap kaise decide karte ho?"</p><p>Main pehle real logs padhta hoon, pattern ki normal rate seekhta hoon, threshold usse saaf upar rakhta hoon, aur group-by wahi chunta hoon jo "same cheez" maani jaaye, aksar source address. Filter Log View mein confirm karta hoon aur phir generated traffic se handler test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filter real log fields se likho; policy deny action=deny hai, blocked nahi.</li>
<li>Wahi filter pehle Log View mein test karo; wahan zero matches ka matlab zero events.</li>
<li>Policy deny aur profile block alag log types aur fields hain.</li>
<li>Threshold normal behaviour se chuno aur group-by "same cheez" ke hisaab se.</li>
<li>Severities meaningful rakho taaki board kaam ka rahe.</li>
</ul></div>
`}};export{e as default};