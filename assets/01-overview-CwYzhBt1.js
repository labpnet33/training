var e={id:`overview`,h:{en:`Guest and failure handling: the big picture`,hi:`Guest aur failure handling: big picture`},body:{en:`
<p><b>What you will learn in this module.</b> Modules 1 to 3 taught you the happy path: a client connects, the switch asks ClearPass, ClearPass answers with a role, and the port opens in the right VLAN. This module is about everything that is not the happy path. You will learn how to design and configure three safety nets on an Aruba AOS-CX access switch: the <b>reject-role</b> (what a failed login gets), the <b>critical-role</b> (what users get when ClearPass is unreachable) and <b>CoA / Disconnect</b> (how ClearPass changes a session that is already running). You will also learn, honestly and conceptually, how guest self-registration, captive portals, OnGuard posture checks, device profiling and Onboard fit around those safety nets.</p>
<p><b>Prerequisites.</b> You should already know the 802.1X and MAC authentication flow, what a network device (NAD) is, how a ClearPass service, role mapping, enforcement policy and enforcement profile chain together, and how an AOS-CX <code>port-access role</code> carries a VLAN. If any of that is hazy, revisit modules 1 to 3 first. We will refer back to them but will not re-teach them.</p>

<h3>Start with an analogy: the reception desk of an office tower</h3>
<p>Picture a large office building. Normally an employee taps a badge, the reception system says "Engineering, floor 10", and the turnstile opens. Now imagine three bad days.</p>
<ul>
<li><b>Bad badge.</b> Someone taps a badge that the system rejects. A sensible building does not leave the person stuck outside in the rain. It sends them to the visitor lobby: Wi-Fi in the lobby, but no lift to the office floors. That is the <b>reject-role</b>.</li>
<li><b>Reception system offline.</b> The badge server loses power. If the doors stay locked, nobody can work. So security keeps a short emergency procedure: known staff are allowed to their own floor until the system returns. That is the <b>critical-role</b>.</li>
<li><b>Person already inside is flagged.</b> At 11:00 a visitor already on the 10th floor is reported as risky. Changing the guest list does nothing, because the person already passed the turnstile. Security has to radio the guard on that floor and say "walk this person back to the lobby". That radio call is <b>CoA / Disconnect</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three safety nets">
<rect x="10" y="10" width="190" height="130" rx="10" fill="#fed7aa"/><text x="105" y="36" text-anchor="middle" class="svg-ink" font-size="14">Reject-role</text><text x="105" y="62" text-anchor="middle" class="svg-muted" font-size="12">ClearPass said NO</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="12">user lands in GUEST</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">VLAN 40, internet only</text>
<rect x="225" y="10" width="190" height="130" rx="10" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">Critical-role</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">ClearPass not reachable</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">staff keep working</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">role CRITICAL, VLAN 10</text>
<rect x="440" y="10" width="190" height="130" rx="10" fill="#ddd6fe"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="14">CoA / Disconnect</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="12">session already live</text><text x="535" y="86" text-anchor="middle" class="svg-muted" font-size="12">ClearPass pushes a change</text><text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="12">UDP 3799, RFC 5176</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Login time: reject and critical.  Run time: CoA.</text>
</svg><p class="cap">Two safety nets act when a client connects; the third acts later, on a session that is already running.</p></div>

<h3>The lab network you will use</h3>
<p>All three labs run on the same topology. ACCESS is a 12-port AOS-CX-style access switch. Behind router R1 sit CPPM, the ClearPass-style policy server at 10.20.60.10, and APP1, the application server at 10.20.70.20. LAPTOP1 (user alice) is on port 1/1/3 and LAPTOP2 (user bob) is on 1/1/4. The VLANs are 10 EMPLOYEE, 20 CONTRACTOR, 30 IOT, 40 GUEST, 50 QUARANTINE and 99 INFRA. The shared RADIUS secret is ArubaNK1. R1 has two access lists that matter here: GUEST-IN blocks VLAN 40 from the internal networks, and QUAR-IN lets VLAN 50 reach only 10.20.60.0/24, the ClearPass and remediation network.</p>

<table class="cmp"><tr><th>Situation</th><th>Who decides</th><th>Switch object</th><th>Lab</th></tr>
<tr><td>Login failed (bad password)</td><td>ClearPass says reject; the switch applies</td><td><code>reject-role</code></td><td>cp-reject-role</td></tr>
<tr><td>ClearPass unreachable</td><td>The switch alone</td><td><code>critical-role</code></td><td>cp-critical-role</td></tr>
<tr><td>Live session must change</td><td>ClearPass pushes, the switch obeys</td><td><code>radius dyn-authorization</code></td><td>cp-coa</td></tr></table>

<h3>What is simulated and what is a concept</h3>
<p>Be clear about this from the start, because exams and interviews will ask about the whole picture. The lab simulates the reject-role, the critical-role and RFC 5176 Disconnect and CoA. The lab does <b>not</b> simulate the guest self-registration portal, captive-portal redirection, OnGuard posture agents, device profiling or Onboard. We teach those as concepts, with the real behaviour, and each is labelled <b>not simulated in the lab</b>. The real ClearPass Policy Manager is also a web GUI. In this course we show you the real GUI path and then the lab shell command that mirrors it, labelled "Lab shell".</p>

<div class="warn"><p><b>Common mistake.</b> Treating "guest" as a product feature you switch on. A guest outcome is just a role (a VLAN plus restrictions) that is reached by one of several routes: a failed login, a guest portal login, or a MAC-caching rule. The route changes; the enforcement object on the switch is the same.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reject-role and critical-role are configured on the <b>switch</b>, per port. ClearPass does not know they exist. ClearPass can only return a role name; it cannot make the switch fall back when it is down.</p></div>

<div class="scn"><h4>The Monday after the power cut</h4><p>A site lost power to its server room over a weekend. When staff arrived, the access switches could not reach ClearPass and every laptop sat on an unauthorized port. The helpdesk had 80 tickets by 9:00. A neighbouring floor, whose ports had a critical-role to the employee VLAN, worked normally. The engineer later added the same critical-role to all employee ports and wrote a rule for what to check once ClearPass returned.</p><p><b>Lesson:</b> failure handling is designed before the failure, on the switch, and costs two lines per port.</p></div>

<div class="iv"><p class="q">"What happens to a client when RADIUS authentication fails, and what happens if the RADIUS server itself is down?"</p><p>Strong answer: a failed authentication is a decision by ClearPass, so the switch can place the client in a reject-role (for example GUEST) instead of leaving the port closed. A dead server is not a decision at all, so the switch uses its critical-role. Say that both are per-port switch settings, and add that CoA is a third mechanism that changes sessions that are already live.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers what happens when login fails, when ClearPass is down, and when a live session must change.</li>
<li>Reject-role and critical-role are AOS-CX per-port settings; CoA needs dyn-authorization on the switch and CoA enabled on the ClearPass network device.</li>
<li>Guest, posture, profiling and Onboard are taught as concepts and are not simulated in the lab.</li>
<li>Labs: cp-reject-role, cp-critical-role and cp-coa, on the same Mumbai HQ topology.</li>
<li>Failure handling is designed in advance, on the switch.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Module 1 se 3 mein aapne happy path seekha: client connect hota hai, switch ClearPass se poochta hai, ClearPass role ke saath jawab deta hai, aur port sahi VLAN mein khul jaata hai. Yeh module us sab ke baare mein hai jo happy path nahi hai. Aap Aruba AOS-CX access switch par teen safety nets design aur configure karna seekhoge: <b>reject-role</b> (failed login ko kya milta hai), <b>critical-role</b> (jab ClearPass unreachable ho to users ko kya milta hai) aur <b>CoA / Disconnect</b> (jo session already chal raha hai use ClearPass kaise badalta hai). Aap yeh bhi seekhoge, honestly aur conceptually, ki guest self-registration, captive portal, OnGuard posture checks, device profiling aur Onboard in safety nets ke aas-paas kaise fit hote hain.</p>
<p><b>Prerequisites.</b> Aapko 802.1X aur MAC authentication ka flow, network device (NAD) kya hota hai, ClearPass service, role mapping, enforcement policy aur enforcement profile ki chain, aur AOS-CX <code>port-access role</code> VLAN kaise carry karta hai, yeh pehle se aana chahiye. Agar kuch dhundhla hai to pehle module 1 se 3 dubara dekho. Hum unka reference denge lekin dobara nahi padhayenge.</p>

<h3>Ek analogy se shuru karo: office tower ka reception desk</h3>
<p>Ek bada office building socho. Normally employee badge tap karta hai, reception system bolta hai "Engineering, floor 10", aur turnstile khul jaata hai. Ab teen kharab din socho.</p>
<ul>
<li><b>Galat badge.</b> Koi aisa badge tap karta hai jo system reject karta hai. Samajhdar building us insaan ko baarish mein bahar nahi chhodti. Use visitor lobby bhej deti hai: lobby mein Wi-Fi hai, lekin office floors ki lift nahi. Yeh hai <b>reject-role</b>.</li>
<li><b>Reception system offline.</b> Badge server ki power chali gayi. Agar darwaze locked rahe to koi kaam nahi kar sakta. Isliye security ke paas ek chhoti emergency procedure hoti hai: jaane-pehchane staff ko system wapas aane tak unke apne floor par jaane diya jaata hai. Yeh hai <b>critical-role</b>.</li>
<li><b>Andar baitha insaan flag ho gaya.</b> 11:00 baje 10th floor par pehle se baitha ek visitor risky report hota hai. Guest list badalne se kuch nahi hota, kyunki woh turnstile pehle hi paar kar chuka hai. Security ko us floor ke guard ko radio karna padta hai: "is insaan ko lobby tak wapas le jao". Yeh radio call hai <b>CoA / Disconnect</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Teen safety nets">
<rect x="10" y="10" width="190" height="130" rx="10" fill="#fed7aa"/><text x="105" y="36" text-anchor="middle" class="svg-ink" font-size="14">Reject-role</text><text x="105" y="62" text-anchor="middle" class="svg-muted" font-size="12">ClearPass ne NO bola</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="12">user GUEST mein land</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">VLAN 40, sirf internet</text>
<rect x="225" y="10" width="190" height="130" rx="10" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">Critical-role</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">ClearPass unreachable</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">staff kaam karta rahe</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">role CRITICAL, VLAN 10</text>
<rect x="440" y="10" width="190" height="130" rx="10" fill="#ddd6fe"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="14">CoA / Disconnect</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="12">session already live</text><text x="535" y="86" text-anchor="middle" class="svg-muted" font-size="12">ClearPass change push karta hai</text><text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="12">UDP 3799, RFC 5176</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Login time: reject aur critical.  Run time: CoA.</text>
</svg><p class="cap">Do safety nets client ke connect hote waqt kaam karte hain; teesra baad mein, already chalte session par kaam karta hai.</p></div>

<h3>Lab network jo aap use karoge</h3>
<p>Teeno labs same topology par chalte hain. ACCESS 12-port AOS-CX-style access switch hai. Router R1 ke peeche CPPM hai, ClearPass-style policy server 10.20.60.10 par, aur APP1, application server 10.20.70.20 par. LAPTOP1 (user alice) port 1/1/3 par hai aur LAPTOP2 (user bob) 1/1/4 par. VLANs hain 10 EMPLOYEE, 20 CONTRACTOR, 30 IOT, 40 GUEST, 50 QUARANTINE aur 99 INFRA. Shared RADIUS secret ArubaNK1 hai. R1 par do access lists yahan matter karti hain: GUEST-IN VLAN 40 ko internal networks se block karti hai, aur QUAR-IN VLAN 50 ko sirf 10.20.60.0/24 tak jaane deti hai, yaani ClearPass aur remediation network.</p>

<table class="cmp"><tr><th>Situation</th><th>Kaun decide karta hai</th><th>Switch object</th><th>Lab</th></tr>
<tr><td>Login fail (galat password)</td><td>ClearPass reject bolta hai; switch apply karta hai</td><td><code>reject-role</code></td><td>cp-reject-role</td></tr>
<tr><td>ClearPass unreachable</td><td>Sirf switch</td><td><code>critical-role</code></td><td>cp-critical-role</td></tr>
<tr><td>Live session badalna hai</td><td>ClearPass push karta hai, switch maanta hai</td><td><code>radius dyn-authorization</code></td><td>cp-coa</td></tr></table>

<h3>Kya simulated hai aur kya sirf concept</h3>
<p>Yeh shuru se hi clear rakho, kyunki exams aur interviews poori picture poochte hain. Lab reject-role, critical-role aur RFC 5176 Disconnect aur CoA simulate karta hai. Lab guest self-registration portal, captive-portal redirection, OnGuard posture agents, device profiling ya Onboard simulate <b>nahi</b> karta. Inhe hum concepts ki tarah padhate hain, real behaviour ke saath, aur har ek par <b>not simulated in the lab</b> ka label hota hai. Real ClearPass Policy Manager ek web GUI bhi hai. Is course mein hum real GUI path dikhate hain aur phir uska mirror karne wala lab shell command, jise "Lab shell" label karte hain.</p>

<div class="warn"><p><b>Common mistake.</b> "Guest" ko aisa product feature samajhna jise switch on karte hain. Guest outcome sirf ek role hai (VLAN plus restrictions) jise kai raaston se paaya ja sakta hai: failed login, guest portal login ya MAC-caching rule. Raasta badalta hai; switch par enforcement object wahi rehta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reject-role aur critical-role <b>switch</b> par, per port configure hote hain. ClearPass ko pata hi nahi ki woh exist karte hain. ClearPass sirf role name return kar sakta hai; woh khud down ho to switch ko fallback nahi karwa sakta.</p></div>

<div class="scn"><h4>Power cut ke baad ka Monday</h4><p>Ek site ki server room ki power weekend par chali gayi. Staff aaya to access switches ClearPass tak nahi pahunch pa rahe the aur har laptop unauthorized port par baitha tha. 9:00 tak helpdesk par 80 tickets thi. Paas wale floor ke ports par employee VLAN ka critical-role tha, wahan sab normal chala. Engineer ne baad mein sab employee ports par wahi critical-role lagaya aur likha ki ClearPass wapas aane par kya check karna hai.</p><p><b>Seekh:</b> failure handling failure se pehle, switch par design hoti hai, aur per port sirf do lines ki hoti hai.</p></div>

<div class="iv"><p class="q">"RADIUS authentication fail ho jaye to client ka kya hota hai, aur RADIUS server hi down ho to kya hota hai?"</p><p>Strong answer: failed authentication ClearPass ka decision hai, isliye switch client ko port band chhodne ke bajaye reject-role (jaise GUEST) mein daal sakta hai. Dead server koi decision hi nahi hai, isliye switch apna critical-role use karta hai. Bolo ki dono per-port switch settings hain, aur add karo ki CoA teesra mechanism hai jo already live sessions ko badalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module cover karta hai: login fail ho, ClearPass down ho, aur live session badalna ho to kya hota hai.</li>
<li>Reject-role aur critical-role AOS-CX per-port settings hain; CoA ke liye switch par dyn-authorization aur ClearPass network device par CoA enable chahiye.</li>
<li>Guest, posture, profiling aur Onboard concepts ki tarah padhaye jaate hain aur lab mein simulated nahi hain.</li>
<li>Labs: cp-reject-role, cp-critical-role aur cp-coa, same Mumbai HQ topology par.</li>
<li>Failure handling pehle se, switch par design hoti hai.</li>
</ul></div>
`}};export{e as default};