var e={id:`packet-flow`,h:{en:`Packet flow and the life of a session`,hi:`Packet flow aur session ki zindagi`},body:{en:`

<p><b>Why packet flow comes first.</b> Every test command and every counter maps to one stage of the path a packet takes through the firewall. If you know the stages, a counter name or a missing session immediately tells you where to look. Without them you are guessing.</p>

<h3>Analogy: a visa desk that remembers you</h3>
<p>Think of a border post. A traveller arriving for the first time goes through the full process: passport check, which gate to use, which rule applies, and a stamp. After the stamp the officer remembers him for the day: the same traveller passes through quickly and nobody re-reads the rulebook. PAN-OS works the same way. The first packet of a connection goes through the slow, thorough path. Every later packet of that session matches the stored <b>session</b> and takes the fast path.</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="Packet flow stages"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Ingress and session lookup</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">existing session? yes means fast path, no means slow path</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Ingress zone and route lookup</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">zone from the interface, egress interface from the routing table</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. NAT policy lookup</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">pre-NAT zones and original addresses</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Security policy lookup</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">original addresses and ports, post-NAT destination zone</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Session created, App-ID and content checks</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">application identified, profiles applied</text><line x1="320" y1="294" x2="320" y2="310" stroke="#64748b" stroke-width="2"/><rect x="60" y="310" width="520" height="44" rx="9" fill="#e2e8f0"/><text x="320" y="329" text-anchor="middle" class="svg-ink" font-size="13">6. Egress: translation applied, packet sent</text><text x="320" y="345" text-anchor="middle" class="svg-muted" font-size="11">session now ACTIVE, later packets use the fast path</text></svg><p class="cap">First packet slow path, later packets fast path. Drops at stage 4 raise flow_policy_deny.</p></div>

<h3>The stages in plain words</h3>
<ol>
<li><b>Session lookup.</b> The firewall looks for an existing session that matches the packet. If it finds one, the packet is handled by that session and skipped through the rest.</li>
<li><b>Zone and route.</b> The ingress interface belongs to a zone. If the interface has no zone, the packet is dropped (counter <code>flow_fwd_notopology</code>). The firewall then looks up the destination in the routing table of the virtual router to find the egress interface and zone.</li>
<li><b>NAT policy.</b> The NAT rulebase is evaluated with the zones and addresses <i>before</i> translation.</li>
<li><b>Security policy.</b> Rules are matched top to bottom with the <i>original</i> source and destination addresses and the post-NAT destination zone. If nothing matches, the predefined rules apply: <code>intrazone-default</code> allows traffic inside a zone, <code>interzone-default</code> denies traffic between zones.</li>
<li><b>Session setup and Layer 7.</b> The firewall creates the session, identifies the application (App-ID) and applies any security profiles.</li>
<li><b>Egress.</b> The translation from the NAT rule is applied, and the packet leaves.</li>
</ol>
<p>Return packets match the <b>same session</b>, because the session stores both directions: the client-to-server flow (<code>c2s</code>) and the server-to-client flow (<code>s2c</code>) with their translated addresses. That is why you never write a second rule for reply traffic.</p>

<div class="note"><p><b>Note.</b> The traffic stages above are a teaching model that matches what you can observe with the test commands and counters. The real data plane has more internal steps, but these are the ones that decide a ticket.</p></div>

<h3>Session states and timeouts</h3>
<p>A session moves through states. The state you will see most is <b>ACTIVE</b>. A new TCP connection is first being set up, an established one is ACTIVE, and a finished one is closing and then removed. The session also has a <b>timeout</b>: if no packet arrives for that long, the session is aged out. The lab shows a timeout of 3600 seconds for TCP in its session detail. An aged-out session writes its traffic log entry with the end reason <code>aged-out</code>.</p>
<table class="cmp"><tr><th>If you see...</th><th>It usually means...</th></tr>
<tr><td>flow_fwd_notopology rising</td><td>Packets arrive on an interface that has no zone</td></tr>
<tr><td>flow_policy_deny rising</td><td>Stage 4: a rule (or the default) denied the first packet</td></tr>
<tr><td>No session and no counter</td><td>The packet never reached the firewall, or was lost before it; check routing and the far end</td></tr>
<tr><td>Session exists but no replies</td><td>Forward path works; check return route, NAT and the far end</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) opens a connection to 8.8.8.8 port 80. Stage 2 finds the egress interface ethernet1/1, zone untrust. Stage 3 matches SNAT-Out (trust to untrust). Stage 4 matches Allow-Out (web-browsing is allowed). The session is created, the source is translated to 203.0.113.2, and the reply from 8.8.8.8 matches the same session and is translated back to 10.0.1.10.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing a security rule and expecting an existing session to change behaviour. Rules are evaluated for the first packet of a session. An established session keeps going until it ends or you clear it with clear session id. Test a change with a new connection.</p></div>
<div class="exam"><p><b>Exam trap.</b> Security policy matches the pre-NAT address but the post-NAT destination zone. If a question gives you a destination NAT and asks which address to use in the security rule, the answer is the original, public address.</p></div>

<div class="scn"><h4>The rule change that "did nothing"</h4><p>An engineer blocked a risky application on a rule and committed. The user, who already had an open session, said nothing changed. The session was still ACTIVE with a one hour timeout and kept using the old decision. After clear session id for that one session, the next connection hit the new rule and was denied, as intended.</p><p><b>Lesson:</b> Policy decisions are made at session creation. Clear the specific session, never all sessions on a production firewall, to apply a change to an existing flow.</p></div>

<div class="iv"><p class="q">"Walk me through how a Palo Alto firewall processes the first packet of a new connection."</p><p>It does a session lookup, finds none, determines the ingress zone and does a route lookup for the egress interface and zone. It evaluates the NAT policy with pre-NAT zones and addresses, then the security policy with original addresses and the post-NAT destination zone. It creates the session, identifies the application, applies profiles, translates and forwards. Mention that later packets match the session and skip these stages.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The first packet takes the slow path; later packets match the session.</li>
<li>Order: session lookup, zone and route, NAT policy, security policy, session and App-ID, egress.</li>
<li>Security rules use pre-NAT addresses with the post-NAT destination zone.</li>
<li>interzone-default denies, intrazone-default allows, when no rule matches.</li>
<li>An existing session ignores new rules until it ends or you clear it.</li>
</ul></div>

`,hi:`

<p><b>Packet flow pehle kyun.</b> Har test command aur har counter us raaste ke ek stage se juda hai jo packet firewall ke andar leta hai. Stages pata hon to counter ka naam ya gayab session turant batata hai ki kahan dekhna hai. Warna aap andaza laga rahe ho.</p>

<h3>Analogy: visa desk jo aapko yaad rakhta hai</h3>
<p>Border post socho. Pehli baar aaya traveller poora process karta hai: passport check, kaunsa gate, kaunsa rule, aur stamp. Stamp ke baad officer use din bhar yaad rakhta hai: wahi traveller jaldi nikal jaata hai aur koi rulebook dobara nahi padhta. PAN-OS bhi aise hi kaam karta hai. Connection ka pehla packet slow, thorough path se jaata hai. Us session ke baaki saare packets stored <b>session</b> se match karte hain aur fast path lete hain.</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="Packet flow stages"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Ingress aur session lookup</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">session hai? haan to fast path, nahi to slow path</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Ingress zone aur route lookup</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">zone interface se, egress interface routing table se</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. NAT policy lookup</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">pre-NAT zones aur original addresses</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Security policy lookup</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">original addresses aur ports, post-NAT destination zone</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Session bana, App-ID aur content checks</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">application pehchani, profiles lage</text><line x1="320" y1="294" x2="320" y2="310" stroke="#64748b" stroke-width="2"/><rect x="60" y="310" width="520" height="44" rx="9" fill="#e2e8f0"/><text x="320" y="329" text-anchor="middle" class="svg-ink" font-size="13">6. Egress: translation lagi, packet gaya</text><text x="320" y="345" text-anchor="middle" class="svg-muted" font-size="11">session ACTIVE, aage ke packets fast path par</text></svg><p class="cap">Pehla packet slow path, baaki fast path. Stage 4 ke drops flow_policy_deny badhate hain.</p></div>

<h3>Stages saaf shabdon mein</h3>
<ol>
<li><b>Session lookup.</b> Firewall packet se match karta existing session dhoondta hai. Mil jaye to packet us session se handle hota hai aur baaki stages skip ho jaate hain.</li>
<li><b>Zone aur route.</b> Ingress interface ek zone ka hota hai. Interface ka zone na ho to packet drop hota hai (counter <code>flow_fwd_notopology</code>). Phir firewall virtual router ke routing table mein destination dekhta hai taaki egress interface aur zone mile.</li>
<li><b>NAT policy.</b> NAT rulebase translation se <i>pehle</i> ke zones aur addresses se evaluate hota hai.</li>
<li><b>Security policy.</b> Rules upar se neeche <i>original</i> source aur destination addresses aur post-NAT destination zone se match hote hain. Kuch match na ho to predefined rules lagte hain: <code>intrazone-default</code> zone ke andar allow karti hai, <code>interzone-default</code> zones ke beech deny karti hai.</li>
<li><b>Session setup aur Layer 7.</b> Firewall session banata hai, application (App-ID) pehchanta hai aur security profiles lagata hai.</li>
<li><b>Egress.</b> NAT rule ki translation lagti hai aur packet nikal jaata hai.</li>
</ol>
<p>Return packets <b>usi session</b> se match karte hain, kyunki session dono directions store karta hai: client-to-server flow (<code>c2s</code>) aur server-to-client flow (<code>s2c</code>) translated addresses ke saath. Isi liye reply traffic ke liye doosri rule nahi likhte.</p>

<div class="note"><p><b>Note.</b> Upar ke stages ek teaching model hain jo test commands aur counters se dikhne waali cheezon se match karta hai. Asli data plane mein aur internal steps hote hain, lekin ticket yahi stages decide karte hain.</p></div>

<h3>Session states aur timeouts</h3>
<p>Session states se guzarta hai. Sabse zyada <b>ACTIVE</b> dikhega. Naya TCP connection pehle set up hota hai, established ACTIVE hota hai, aur khatam hone par closing phir remove. Session ka ek <b>timeout</b> bhi hota hai: itni der koi packet na aaye to session age out ho jaata hai. Lab apne session detail mein TCP ke liye 3600 seconds ka timeout dikhata hai. Age-out hue session ki traffic log entry end reason <code>aged-out</code> ke saath likhi jaati hai.</p>
<table class="cmp"><tr><th>Agar dikhe...</th><th>Aam taur par matlab...</th></tr>
<tr><td>flow_fwd_notopology badh raha</td><td>Packets aise interface par aa rahe hain jiska zone nahi</td></tr>
<tr><td>flow_policy_deny badh raha</td><td>Stage 4: rule (ya default) ne pehla packet deny kiya</td></tr>
<tr><td>Na session na counter</td><td>Packet firewall tak pahuncha hi nahi, ya pehle kho gaya; routing aur far end dekho</td></tr>
<tr><td>Session hai lekin reply nahi</td><td>Forward path chal raha; return route, NAT aur far end dekho</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) 8.8.8.8 port 80 par connection kholta hai. Stage 2 egress interface ethernet1/1, zone untrust nikalta hai. Stage 3 SNAT-Out match karta hai (trust se untrust). Stage 4 Allow-Out match karta hai (web-browsing allowed hai). Session banta hai, source 203.0.113.2 mein translate hota hai, aur 8.8.8.8 ka reply usi session se match hokar wapas 10.0.1.10 mein translate hota hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Security rule badalkar umeed karna ki existing session ka behaviour badal jaayega. Rules session ke pehle packet par evaluate hoti hain. Established session tab tak chalta rehta hai jab tak khatam na ho ya aap clear session id se clear na karo. Change ko naye connection se test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Security policy pre-NAT address match karti hai lekin post-NAT destination zone. Agar sawaal mein destination NAT ho aur poochhe security rule mein kaunsa address, to jawab original, public address hai.</p></div>

<div class="scn"><h4>Woh rule change jisne "kuch nahi kiya"</h4><p>Ek engineer ne rule par risky application block kiya aur commit kiya. User, jiska session pehle se khula tha, bola kuch nahi badla. Session ACTIVE tha, ek ghante ke timeout ke saath, aur purana decision use karta raha. Us ek session par clear session id ke baad agla connection nayi rule se takra kar deny hua, jaisa chahiye tha.</p><p><b>Lesson:</b> Policy decisions session banate waqt hote hain. Existing flow par change lagane ke liye specific session clear karo, production firewall par kabhi saare sessions nahi.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall naye connection ka pehla packet kaise process karta hai?"</p><p>Session lookup karta hai, nahi milta, ingress zone nikalta hai aur egress interface aur zone ke liye route lookup karta hai. NAT policy pre-NAT zones aur addresses se evaluate karta hai, phir security policy original addresses aur post-NAT destination zone se. Session banata hai, application pehchanta hai, profiles lagata hai, translate karke forward karta hai. Batao ki baad ke packets session se match hokar yeh stages skip karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehla packet slow path leta hai; baaki packets session se match karte hain.</li>
<li>Order: session lookup, zone aur route, NAT policy, security policy, session aur App-ID, egress.</li>
<li>Security rules pre-NAT addresses aur post-NAT destination zone use karti hain.</li>
<li>Rule match na ho to interzone-default deny, intrazone-default allow karti hai.</li>
<li>Existing session naye rules ignore karta hai jab tak khatam na ho ya clear na karo.</li>
</ul></div>

`}};export{e as default};