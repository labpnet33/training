var e={id:`overview`,h:{en:`Operations: keeping network access control healthy`,hi:`Operations: network access control ko healthy rakhna`},body:{en:`
<p>Think of a hospital emergency room. Building the hospital is one job; running it every night is another. The nurses at the front desk do not guess: they take a note of the complaint, check the monitors, follow a fixed order of questions and only then call the right doctor. <b>Operations</b> in ClearPass is exactly this. The policy is built (modules 1 to 5). Now users call, ports stay dead, a clean-up deletes a VLAN, a new camera arrives, and you must find the cause quickly, fix only that cause, and prove the fix.</p>

<h3>What you will learn</h3>
<ul>
<li>How a request travels through ClearPass in six stages, and which tool shows which stage.</li>
<li>How to read the <b>Access Tracker</b> (tabs Summary, Input, Output, Alerts) and the <b>Event Viewer</b>.</li>
<li>The alert codes you will meet most: 215, 216, 217, 9002 and the lab codes 9003 to 9011.</li>
<li>A systematic triage method: symptom, where to look, likely cause, smallest fix, proof.</li>
<li>Two full troubleshooting labs: <b>cp-vlan-missing</b> and <b>cp-tracker-triage</b>.</li>
<li>A pre-change checklist and a safe rollout routine, finished by the lab <b>cp-capstone</b> (camera rollout and <code>write memory</code>).</li>
<li>Backup, restore, upgrade and licensing as concepts (clearly marked: not simulated in the lab).</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished the five earlier ClearPass modules: the NAD trust and first service, wired 802.1X and MAC authentication, role mapping and enforcement, guest and reject/critical roles with CoA, and deployment checks such as shared secret and NAD address. This module does not re-teach them in depth; it uses them as the vocabulary of troubleshooting. If you cannot yet say what a service, a role mapping and an enforcement profile do, revisit module 4 first.</p>

<h3>The lab and what is real</h3>
<p>All labs run on two original CONFIG learning models: a ClearPass-style policy server and an Aruba AOS-CX-style access switch. They are teaching models, not HPE or Aruba software. The real Policy Manager is configured in its web GUI. The lab uses a text shell whose commands mirror the GUI menu path, for example <code>configuration enforcement policy ...</code> is Configuration &gt; Enforcement &gt; Policies. In this module we always teach the real GUI idea first and then show the <b>Lab shell</b> command as practice.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operations loop">
<rect x="20" y="40" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="14">1 Symptom</text><text x="85" y="85" text-anchor="middle" class="svg-muted" font-size="12">user report</text>
<rect x="175" y="40" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="14">2 Evidence</text><text x="240" y="85" text-anchor="middle" class="svg-muted" font-size="12">tracker, switch</text>
<rect x="330" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="14">3 Cause</text><text x="395" y="85" text-anchor="middle" class="svg-muted" font-size="12">one layer only</text>
<rect x="485" y="40" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="14">4 Fix + proof</text><text x="550" y="85" text-anchor="middle" class="svg-muted" font-size="12">then save</text>
<line x1="150" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="305" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="460" y1="70" x2="485" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Never fix before you can name the cause. Never stop before you can prove the fix.</text>
</svg><p class="cap">The operator loop used in every lab of this module.</p></div>

<h3>Why operations deserves its own module</h3>
<p>Most real tickets are not design errors; they are small drifts: an account disabled by HR automation, a password changed in one place, a VLAN removed from a trunk, a test service left on top of the list. A ClearPass engineer who only knows how to build gets lost. An engineer who can read the evidence in two minutes becomes the person everyone calls.</p>

<div class="eg"><p><b>Worked example.</b> Monday 09:10: three users report no access. A beginner resets everything and takes an hour. An operator opens the Access Tracker, sees three rejected rows with three different codes (215, 217, 216), fixes one object per row on ClearPass and is done in ten minutes. That is the lab <b>cp-tracker-triage</b>, and you will do it in chapter 7.</p></div>

<h3>Lab facts you will reuse</h3>
<ul>
<li>ACCESS (AOS-CX-style switch, ports 1/1/1 to 1/1/12) sources its RADIUS requests from the Vlan99 address <code>10.20.99.2</code>. That is the NAD address ClearPass must know.</li>
<li>CPPM is <code>10.20.60.10</code>, APP1 is <code>10.20.70.20</code>, shared secret <code>ArubaNK1</code>.</li>
<li>Users alice (Engineering) and bob (Contractor); printer PRN1 on 1/1/5; camera CAM1 on 1/1/6 (only in the capstone).</li>
<li>VLANs: 10 EMPLOYEE, 20 CONTRACTOR, 30 IOT, 40 GUEST, 50 QUARANTINE, 99 INFRA.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Starting with the client and changing things at random (new password, reboot, new cable). Without evidence you cannot know which of your five changes fixed the problem, and you may break something that worked.</p></div>

<div class="exam"><p><b>Exam trap.</b> Operations questions describe a symptom and ask for the <i>first</i> place to look. For "request never arrives" the answer is the Event Viewer and the NAD configuration; for "request arrives but is rejected" it is the Access Tracker alerts.</p></div>

<div class="scn"><h4>The clean-up that broke Monday</h4><p>A weekend clean-up removed "unused" VLANs on the access switch. On Monday contractors could not connect. The first engineer reset passwords in ClearPass and lost an hour. The second opened the Access Tracker, saw an Accept with role CONTRACTOR, and concluded the policy was fine; the fault was on the switch.</p><p><b>Lesson:</b> an Accept in ClearPass does not mean the user has access. Verify both sides, decision and session.</p></div>

<div class="iv"><p class="q">"A user says the network is not working. What do you do first?"</p><p>I identify one attempt (user, device, port, time), then check whether ClearPass saw the request in the Access Tracker. Seen and rejected: read the alert code. Not seen: Event Viewer and NAD settings. Accepted but no access: the switch role, VLAN and DHCP. I fix one layer, retest and document.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Operations is a loop: symptom, evidence, cause, fix, proof.</li>
<li>The Access Tracker and Event Viewer are your first two instruments.</li>
<li>An Accept is a decision, not proof of connectivity.</li>
<li>Labs use a text shell that mirrors the real GUI path; the real product is GUI-driven.</li>
<li>Insight, backup, upgrade and licensing are concepts here, not simulated.</li>
</ul></div>
`,hi:`
<p>Ek hospital ke emergency room ke baare mein socho. Hospital banana ek kaam hai, aur use roz raat ko chalana doosra kaam. Front desk ke nurses guess nahi karte: woh complaint note karte hain, monitors check karte hain, sawaalon ka fixed order follow karte hain aur tabhi sahi doctor ko bulate hain. ClearPass mein <b>Operations</b> bilkul aisa hi hai. Policy ban chuki hai (modules 1 se 5). Ab users call karte hain, ports dead rehte hain, clean-up mein VLAN delete ho jaata hai, naya camera aata hai, aur aapko jaldi se cause dhoondhna hai, sirf wahi cause fix karna hai aur fix prove karna hai.</p>

<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>Ek request ClearPass mein six stages se kaise guzarti hai, aur kaun sa tool kaun sa stage dikhata hai.</li>
<li><b>Access Tracker</b> (tabs Summary, Input, Output, Alerts) aur <b>Event Viewer</b> kaise padhte hain.</li>
<li>Jo alert codes sabse zyada milenge: 215, 216, 217, 9002 aur lab codes 9003 se 9011.</li>
<li>Systematic triage method: symptom, kahan dekhna hai, likely cause, sabse chhota fix, proof.</li>
<li>Do poore troubleshooting labs: <b>cp-vlan-missing</b> aur <b>cp-tracker-triage</b>.</li>
<li>Pre-change checklist aur safe rollout routine, jiska end lab <b>cp-capstone</b> (camera rollout aur <code>write memory</code>) se hota hai.</li>
<li>Backup, restore, upgrade aur licensing concepts ke roop mein (clearly marked: lab mein simulated nahi).</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapne pehle ke paanch ClearPass modules complete kiye hone chahiye: NAD trust aur first service, wired 802.1X aur MAC authentication, role mapping aur enforcement, guest aur reject/critical roles ke saath CoA, aur deployment checks jaise shared secret aur NAD address. Yeh module unhe depth mein dobara nahi sikhata; unhe troubleshooting ki vocabulary ki tarah use karta hai. Agar aap abhi nahi bata sakte ki service, role mapping aur enforcement profile kya karte hain, to pehle module 4 dobara dekho.</p>

<h3>Lab aur kya real hai</h3>
<p>Saare labs do original CONFIG learning models par chalte hain: ek ClearPass-style policy server aur ek Aruba AOS-CX-style access switch. Yeh teaching models hain, HPE ya Aruba software nahi. Real Policy Manager apne web GUI se configure hota hai. Lab ek text shell use karta hai jiske commands GUI menu path ko mirror karte hain, jaise <code>configuration enforcement policy ...</code> matlab Configuration &gt; Enforcement &gt; Policies. Is module mein hum hamesha pehle real GUI idea sikhate hain aur phir practice ke liye <b>Lab shell</b> command dikhate hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operations loop">
<rect x="20" y="40" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="14">1 Symptom</text><text x="85" y="85" text-anchor="middle" class="svg-muted" font-size="12">user report</text>
<rect x="175" y="40" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="14">2 Evidence</text><text x="240" y="85" text-anchor="middle" class="svg-muted" font-size="12">tracker, switch</text>
<rect x="330" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="14">3 Cause</text><text x="395" y="85" text-anchor="middle" class="svg-muted" font-size="12">sirf ek layer</text>
<rect x="485" y="40" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="14">4 Fix + proof</text><text x="550" y="85" text-anchor="middle" class="svg-muted" font-size="12">phir save</text>
<line x1="150" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="305" y1="70" x2="330" y2="70" stroke="#64748b" stroke-width="2"/><line x1="460" y1="70" x2="485" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Cause bataye bina fix nahi. Proof diye bina stop nahi.</text>
</svg><p class="cap">Is module ke har lab mein use hone wala operator loop.</p></div>

<h3>Operations ka alag module kyon hai</h3>
<p>Zyadatar real tickets design errors nahi hote; woh chhote drifts hote hain: HR automation ne account disable kar diya, ek jagah password badal gaya, trunk se VLAN hat gaya, test service list ke upar chhoot gayi. Jo ClearPass engineer sirf build karna jaanta hai woh kho jaata hai. Jo engineer do minute mein evidence padh leta hai, wahi woh insaan ban jaata hai jise sab bulate hain.</p>

<div class="eg"><p><b>Worked example.</b> Monday 09:10: teen users no access report karte hain. Beginner sab kuch reset karta hai aur ek ghanta lagata hai. Operator Access Tracker kholta hai, teen rejected rows dekhta hai jinke teen alag codes hain (215, 217, 216), ClearPass par har row ke liye ek object fix karta hai aur das minute mein done. Yahi lab <b>cp-tracker-triage</b> hai, aur aap chapter 7 mein karoge.</p></div>

<h3>Lab facts jo aap baar baar use karoge</h3>
<ul>
<li>ACCESS (AOS-CX-style switch, ports 1/1/1 se 1/1/12) apni RADIUS requests Vlan99 address <code>10.20.99.2</code> se source karta hai. Yahi NAD address hai jo ClearPass ko pata hona chahiye.</li>
<li>CPPM <code>10.20.60.10</code> hai, APP1 <code>10.20.70.20</code>, shared secret <code>ArubaNK1</code>.</li>
<li>Users alice (Engineering) aur bob (Contractor); printer PRN1 port 1/1/5 par; camera CAM1 port 1/1/6 par (sirf capstone mein).</li>
<li>VLANs: 10 EMPLOYEE, 20 CONTRACTOR, 30 IOT, 40 GUEST, 50 QUARANTINE, 99 INFRA.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Client se start karke random cheezein badalna (naya password, reboot, naya cable). Evidence ke bina aapko pata nahi chalta ki paanch changes mein se kisne problem fix ki, aur jo chal raha tha woh bhi toot sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Operations questions ek symptom batate hain aur poochte hain ki <i>pehle</i> kahan dekhna hai. "Request kabhi arrive nahi hoti" ka answer Event Viewer aur NAD configuration hai; "request arrive hoti hai par reject hoti hai" ka answer Access Tracker alerts hai.</p></div>

<div class="scn"><h4>Woh clean-up jisne Monday bigaad diya</h4><p>Weekend clean-up mein access switch se "unused" VLANs hata diye gaye. Monday ko contractors connect nahi ho sake. Pehle engineer ne ClearPass mein passwords reset kiye aur ek ghanta kho diya. Doosre ne Access Tracker khola, role CONTRACTOR ke saath Accept dekha, aur samjha ki policy theek hai; fault switch par tha.</p><p><b>Lesson:</b> ClearPass mein Accept ka matlab yeh nahi ki user ko access mil gaya. Dono sides verify karo, decision aur session.</p></div>

<div class="iv"><p class="q">"Ek user kehta hai network kaam nahi kar raha. Aap sabse pehle kya karte ho?"</p><p>Main ek attempt identify karta hoon (user, device, port, time), phir Access Tracker mein dekhta hoon ki ClearPass ne request dekhi ya nahi. Dekhi aur reject hui: alert code padho. Nahi dekhi: Event Viewer aur NAD settings. Accept hui par access nahi: switch role, VLAN aur DHCP. Main ek layer fix karta hoon, retest karta hoon aur document karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Operations ek loop hai: symptom, evidence, cause, fix, proof.</li>
<li>Access Tracker aur Event Viewer aapke pehle do instruments hain.</li>
<li>Accept ek decision hai, connectivity ka proof nahi.</li>
<li>Labs ek text shell use karte hain jo real GUI path ko mirror karta hai; real product GUI-driven hai.</li>
<li>Insight, backup, upgrade aur licensing yahan concepts hain, simulated nahi.</li>
</ul></div>
`}};export{e as default};