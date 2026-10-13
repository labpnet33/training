var e={id:`why-central-management`,h:{en:`Why central management exists and what FortiManager is`,hi:`Central management kyun zaroori hai aur FortiManager kya hai`},body:{en:`
<div class="note"><p><b>What you will learn.</b> Why managing FortiGate firewalls one by one stops working, what FortiManager is and what it is not, which words you need (device, ADOM, policy package, FGFM), and how this module is organised. <b>Prerequisites:</b> FortiGate basics. You can log in to a FortiGate CLI, you know what an interface, a firewall policy and an address object are, and you can read an IP address with a mask. Nothing about FortiManager is assumed.</p></div>

<p>Think of a chain of tea shops with three outlets. The owner decides a new rule: "every cup is served with a paper napkin". Without a head office, the owner phones each shop. One manager forgets, another hears "paper" as "plastic", and a month later a customer notices that the Madurai shop is different. A head office that writes the rule once and sends the same instruction to every shop fixes this. FortiManager is that head office for FortiGate firewalls.</p>

<h3>The problem with one-by-one management</h3>
<p>Our invented company, Kaveri Retail, has a head office in Chennai and branches in Madurai and Trichy. Each branch has its own FortiGate. Every FortiGate holds its own interfaces, address objects, firewall policies and VPN settings. With three devices you can log in to each. With three hundred, the same habit causes four problems.</p>
<table class="cmp"><tr><th>Problem</th><th>What it looks like</th></tr>
<tr><td>Drift</td><td>Object values and policy names differ a little between sites, so behaviour differs and nobody knows why.</td></tr>
<tr><td>Slow change</td><td>One new policy means many logins; a security fix reaches the last site days later.</td></tr>
<tr><td>No single view</td><td>To know which devices are reachable you check each one.</td></tr>
<tr><td>Weak audit</td><td>Nobody can easily show who changed what, where and when.</td></tr>
</table>

<h3>What FortiManager is</h3>
<p><b>FortiManager</b> is a separate system, often a virtual machine, that stores the intended configuration of many FortiGates and sends it to them. In this course the FortiManager is called FMG-1 and has the address 192.0.2.5. It keeps three kinds of data that you will meet in chapter 2: a list of managed devices, one or more administrative domains and the policies and objects inside them.</p>
<p>An <b>ADOM</b> (administrative domain) is a named container inside FortiManager. It holds devices and their policies, so that different teams or firmware versions can be kept apart. Kaveri Retail uses one ADOM called Kaveri. A <b>policy package</b> is a named set of firewall policies that can be installed to one or more FortiGates. <b>FGFM</b> (FortiGate to FortiManager protocol) is the management connection between the two systems; it runs over TCP port 541.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FortiManager and three FortiGates">
<rect x="245" y="14" width="150" height="58" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.5</text>
<rect x="30" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="105" y="165" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="105" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.11</text>
<rect x="245" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="320" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<rect x="460" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="290" y1="72" x2="105" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="72" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="72" x2="535" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="180" y="100" class="svg-accent" font-size="12">FGFM TCP 541</text>
</svg><p class="cap">One FortiManager, three FortiGates, all on the management network 192.0.2.0/24.</p></div>

<h3>What FortiManager is not</h3>
<p>Two beliefs cause many wrong answers. First, FortiManager is not in the traffic path: user traffic from PC-MDU to the intranet never passes through FMG-1. Second, a FortiGate does not stop working when FortiManager is switched off. It keeps forwarding with the last configuration it received; you only lose central change and the single view.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri needs the address object SRV-WEB (192.0.2.80/32) on both branches. By hand that is two logins and two chances for a typo. With FortiManager you create SRV-WEB once in the ADOM Kaveri and install it to both devices. One definition, two devices, no drift.</p></div>

<h3>How this module is organised</h3>
<p>Chapter 2 explains the architecture. Chapters 3 to 5 cover onboarding from the FortiGate side, from the FortiManager side, and finding out why a device is not listed. Chapters 6 to 8 walk through the three labs (fm-onboard, fm-add-fmg, fm-unauth-ts). Chapter 9 is the checklist.</p>

<div class="warn"><p><b>Honest boundaries.</b> The labs run in a simulator, not real FortiManager software. Actions such as authorize and import are GUI or API actions in the real product; the simulator offers them as <code>execute fmgui ...</code> commands and we say so each time. Serial numbers and build numbers are synthetic. This is independent training; it does not prepare you for a vendor exam.</p></div>

<div class="scn"><h4>The policy that reached only two of three branches</h4><p>A retailer added a rule by hand on each FortiGate over two days. At Trichy the engineer typed the wrong subnet and nobody noticed for a month, until a branch user could not reach a server. With a central manager the rule is written once and the device status shows which devices already received it.</p><p><b>Lesson:</b> central management removes mistakes by reducing how often a human types the same thing.</p></div>

<div class="iv"><p class="q">"Why would a company use FortiManager instead of logging in to every FortiGate?"</p><p>Consistency (one definition of objects and policy), speed (change once, install to many), visibility (one device list and status) and audit (revision history). Add that FortiManager is only the management plane: the FortiGates keep forwarding if it is down.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Managing many FortiGates by hand causes drift, slow change, no single view and weak audit.</li>
<li>FortiManager stores intended configuration and sends it to managed FortiGates.</li>
<li>An ADOM is a container for devices and their policies; FGFM is the management tunnel on TCP 541.</li>
<li>FortiManager is not in the traffic path; devices keep working without it.</li>
<li>The labs are a simulator; authorize and import are <code>execute fmgui</code> commands there.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> FortiGate firewalls ko ek-ek karke manage karna kyun fail hone lagta hai, FortiManager kya hai aur kya nahi hai, kaun se words zaroori hain (device, ADOM, policy package, FGFM), aur ye module kaise organised hai. <b>Prerequisites:</b> FortiGate basics. Aap FortiGate CLI mein login kar sakte ho, interface, firewall policy aur address object kya hote hain ye jaante ho, aur mask ke saath IP address padh sakte ho. FortiManager ke baare mein kuch assume nahi kiya gaya.</p></div>

<p>Socho tea shops ki ek chain hai jiske teen outlets hain. Owner ka naya rule hai: "har cup ke saath paper napkin do". Head office ke bina owner har shop ko phone karta hai. Ek manager bhool jata hai, doosra "paper" ko "plastic" sun leta hai, aur ek mahine baad customer dekhta hai ki Madurai ki shop alag hai. Head office jo rule ek baar likhe aur wahi instruction har shop ko bheje, wo ye fix kar deta hai. FortiManager FortiGate firewalls ke liye wahi head office hai.</p>

<h3>Ek-ek karke management ki problem</h3>
<p>Humari invented company Kaveri Retail ka head office Chennai mein hai aur branches Madurai aur Trichy mein. Har branch ka apna FortiGate hai. Har FortiGate ke apne interfaces, address objects, firewall policies aur VPN settings hote hain. Teen devices ho to har ek mein login kar sakte ho. Teen sau ho to wahi aadat chaar problems paida karti hai.</p>
<table class="cmp"><tr><th>Problem</th><th>Kaisi dikhti hai</th></tr>
<tr><td>Drift</td><td>Sites ke beech object values aur policy names thode alag ho jate hain, behaviour alag ho jata hai aur kisi ko wajah nahi pata.</td></tr>
<tr><td>Slow change</td><td>Ek nayi policy matlab kai logins; security fix aakhri site tak din baad pahunchta hai.</td></tr>
<tr><td>Single view nahi</td><td>Kaun se devices reachable hain ye jaanne ke liye har ek check karna padta hai.</td></tr>
<tr><td>Weak audit</td><td>Kisne kya, kahan aur kab badla, ye dikhana mushkil hai.</td></tr>
</table>

<h3>FortiManager kya hai</h3>
<p><b>FortiManager</b> ek alag system hai, aksar virtual machine, jo kai FortiGates ki intended configuration store karta hai aur unhe bhejta hai. Is course mein FortiManager ka naam FMG-1 hai aur address 192.0.2.5. Ye teen tarah ka data rakhta hai jo aap chapter 2 mein dekhoge: managed devices ki list, ek ya zyada administrative domains, aur unke andar policies aur objects.</p>
<p><b>ADOM</b> (administrative domain) FortiManager ke andar ek named container hai. Isme devices aur unki policies hoti hain, taaki alag teams ya firmware versions alag rakhe ja sakein. Kaveri Retail ek ADOM use karta hai jiska naam Kaveri hai. <b>Policy package</b> firewall policies ka named set hai jo ek ya zyada FortiGates par install ho sakta hai. <b>FGFM</b> (FortiGate to FortiManager protocol) dono systems ke beech management connection hai; ye TCP port 541 par chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FortiManager aur teen FortiGates">
<rect x="245" y="14" width="150" height="58" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.5</text>
<rect x="30" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="105" y="165" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="105" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.11</text>
<rect x="245" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="320" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<rect x="460" y="140" width="150" height="58" rx="8" fill="#bae6fd"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="290" y1="72" x2="105" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="72" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="72" x2="535" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="180" y="100" class="svg-accent" font-size="12">FGFM TCP 541</text>
</svg><p class="cap">Ek FortiManager, teen FortiGates, sab management network 192.0.2.0/24 par.</p></div>

<h3>FortiManager kya nahi hai</h3>
<p>Do galatfehmiyan bahut wrong answers ki wajah hain. Pehli, FortiManager traffic path mein nahi hota: PC-MDU se intranet ka user traffic kabhi FMG-1 ke through nahi jata. Doosri, FortiManager band ho jaye to FortiGate kaam karna band nahi karta. Wo last mili configuration ke saath forward karta rehta hai; bas central change aur single view chala jata hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri ko dono branches par address object SRV-WEB (192.0.2.80/32) chahiye. Haath se kare to do logins aur typo ke do mauke. FortiManager mein SRV-WEB ek baar ADOM Kaveri mein banate ho aur dono devices par install karte ho. Ek definition, do devices, koi drift nahi.</p></div>

<h3>Ye module kaise organised hai</h3>
<p>Chapter 2 architecture samjhata hai. Chapters 3 se 5 FortiGate side se onboarding, FortiManager side se onboarding, aur ye pata lagana ki device list mein kyun nahi aaya, cover karte hain. Chapters 6 se 8 teen labs (fm-onboard, fm-add-fmg, fm-unauth-ts) walk through karte hain. Chapter 9 checklist hai.</p>

<div class="warn"><p><b>Honest boundaries.</b> Labs simulator mein chalte hain, real FortiManager software mein nahi. Authorize aur import jaise actions real product mein GUI ya API actions hain; simulator unhe <code>execute fmgui ...</code> commands ki tarah deta hai aur hum har baar ye batate hain. Serial numbers aur build numbers synthetic hain. Ye independent training hai; ye kisi vendor exam ki taiyari nahi karwati.</p></div>

<div class="scn"><h4>Wo policy jo teen mein se sirf do branches tak pahunchi</h4><p>Ek retailer ne do din mein har FortiGate par haath se rule jodha. Trichy mein engineer ne galat subnet type kar diya aur ek mahine tak kisi ko pata nahi chala, jab tak ek branch user server tak nahi pahunch paya. Central manager ke saath rule ek baar likha jata hai aur device status dikhata hai kin devices ko mil chuka hai.</p><p><b>Lesson:</b> central management insaan ke wahi cheez baar-baar type karne ki sankhya kam karke galtiyan hatata hai.</p></div>

<div class="iv"><p class="q">"Company har FortiGate mein login karne ke bajay FortiManager kyun use karegi?"</p><p>Consistency (objects aur policy ki ek definition), speed (ek baar change, kai ko install), visibility (ek device list aur status) aur audit (revision history). Ye bhi jodo ki FortiManager sirf management plane hai: wo down ho to FortiGates forward karte rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kai FortiGates ko haath se manage karne se drift, slow change, no single view aur weak audit hota hai.</li>
<li>FortiManager intended configuration store karta hai aur managed FortiGates ko bhejta hai.</li>
<li>ADOM devices aur policies ka container hai; FGFM TCP 541 par management tunnel hai.</li>
<li>FortiManager traffic path mein nahi hota; devices uske bina bhi chalte hain.</li>
<li>Labs simulator hain; wahan authorize aur import <code>execute fmgui</code> commands hain.</li>
</ul></div>
`}};export{e as default};