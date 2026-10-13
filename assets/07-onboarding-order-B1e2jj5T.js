var e={id:`onboarding-order`,h:{en:`The onboarding order: Manager, Validator, Controller, then edges`,hi:`Onboarding order: Manager, Validator, Controller, phir edges`},body:{en:`
<p>Building a fabric is like opening a new bank branch. First the head office sets the rules and the stamp (Manager). Then the reception that identifies visitors opens (Validator). Then the officers who decide and route work arrive (Controller). Only then are customers admitted (edges). If you let customers in before the officers are ready, they stand in the queue and complain. The same sequence in SD-WAN avoids many confusing half-working states.</p>

<h3>The order and the reason for each step</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Onboarding order">
<rect x="10" y="20" width="140" height="95" rx="10" fill="#fde68a"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">1 Manager</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="10">settings, org name,</text><text x="80" y="76" text-anchor="middle" class="svg-muted" font-size="10">certificate method,</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="10">vbond address</text>
<rect x="170" y="20" width="140" height="95" rx="10" fill="#ddd6fe"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">2 Validator</text><text x="240" y="62" text-anchor="middle" class="svg-muted" font-size="10">added to Manager,</text><text x="240" y="76" text-anchor="middle" class="svg-muted" font-size="10">certificate,</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="10">edge list pushed</text>
<rect x="330" y="20" width="140" height="95" rx="10" fill="#bae6fd"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">3 Controller</text><text x="400" y="62" text-anchor="middle" class="svg-muted" font-size="10">added to Manager,</text><text x="400" y="76" text-anchor="middle" class="svg-muted" font-size="10">certificate,</text><text x="400" y="90" text-anchor="middle" class="svg-muted" font-size="10">OMP ready</text>
<rect x="490" y="20" width="140" height="95" rx="10" fill="#bbf7d0"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">4 WAN edges</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="10">on the list as Valid,</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="10">reach vbond, then</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="10">Controller, Manager</text>
<path d="M150 67 L170 67 M310 67 L330 67 M470 67 L490 67" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="140" width="580" height="75" rx="10" fill="#f1f5f9"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">Check after every step before you start the next one:</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="11">controllers connected to each other, certificates installed, list sent, then add edges.</text><text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="11">One change at a time makes any error easy to locate.</text>
</svg><p class="cap">Each step prepares what the next step needs.</p></div>
<table class="cmp"><tr><th>Step</th><th>What you do</th><th>Why now</th></tr>
<tr><td>1 Manager</td><td>Install, bootstrap, log in. In settings enter the organization name, the Validator address and the certificate authorisation method. Link the Smart Account if using Cisco PKI.</td><td>The Manager holds the settings and the list. It issues and relays the CSRs for the others.</td></tr>
<tr><td>2 Validator</td><td>Install and bootstrap with local vbond-only. Add it to the Manager as a controller, get its certificate, and the Manager can push the WAN edge list.</td><td>Edges and Controllers find everything through the Validator.</td></tr>
<tr><td>3 Controller</td><td>Install and bootstrap. Add it to the Manager as a controller, get its certificate. It connects to the Validator and the Manager.</td><td>It needs the Validator and a certificate before it can accept edges.</td></tr>
<tr><td>4 WAN edges</td><td>Put the devices on the list and mark them Valid, send the list. Power on the edge with a reachable Validator address.</td><td>Every dependency is now in place.</td></tr></table>

<h3>Adding controllers in the Manager</h3>
<p>In the Manager's device configuration section for controllers, you add the Validator and the Controller one by one. For each you supply the device type, its management or VPN 0 IP address, and the login details that the Manager will use to reach it. The option to generate a CSR is selected so that the Manager can request the certificate. After this, the Manager opens a connection to the device and manages its certificate. The Manager itself holds its own certificate too.</p>

<h3>Verifying that the controllers see each other</h3>
<p>Before any edge exists, the controllers should already form control connections with each other. Check on each.</p>
<pre class="out">VSMART# show control connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           PUBLIC
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     STATE
vbond   dtls  10.255.255.3  1     0       198.51.100.30  <span class="hl">up</span>
vmanage dtls  10.255.255.1  1     0       198.51.100.10  <span class="hl">up</span></pre>
<pre class="out">VMANAGE# show control connections
vbond   dtls  10.255.255.3  1     0       198.51.100.30  <span class="hl">up</span>
vsmart  dtls  10.255.255.2  1     1       198.51.100.20  <span class="hl">up</span></pre>
<p>When these rows are up, the three controllers trust each other and the fabric is ready for edges. If a row is missing, fix it now. It is far easier than finding the same fault later among dozens of branches.</p>

<h3>The edge's own sequence</h3>
<p>Once everything is ready, a new edge goes through the following steps. The next chapter shows each step in detail.</p>
<ol>
<li>The edge gets an address in VPN 0 (by DHCP or static) and a default route.</li>
<li>It resolves or uses the Validator address from its system block.</li>
<li>It connects to the Validator, authenticates and receives the Controller and Manager addresses.</li>
<li>It connects to the Controller and the Manager and drops the Validator connection.</li>
<li>OMP starts. Routes, TLOCs and keys flow.</li>
</ol>

<div class="eg"><p><b>Order in practice.</b> The team installs VMANAGE first and logs in. In the settings they enter NK-LAB as the organization name and 198.51.100.30 as the Validator. They add VBOND, then VSMART as controllers, install the certificates, and confirm the two rows on VMANAGE are up. They upload the list with E-DEL-1, E-MUM-1 and E-BLR-1 as valid. Only then do they power on the edges. Each router joins within a minute.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Powering on edges before the Validator and Controller are ready; changing several things in one session so the cause of a fault is unclear; adding the Controller before the Validator has its certificate; forgetting to set the organization name in the Manager before adding controllers.</p></div>

<div class="exam"><p><b>Exam traps.</b> The order is Manager, Validator, Controller, then WAN edges. The Manager is first because settings and certificate requests start there. The edge talks to the Validator first, then the Controller and the Manager.</p></div>

<div class="scn"><h4>Two Controllers, one forgotten certificate</h4><p>A team added two Controllers to a live fabric. One joined; the other stayed down for the next day. Edges that were assigned to it connected only to the first, so nobody noticed until a maintenance window removed the first one. The second Controller's certificate had never been installed. After the incident the runbook added a check of the four control-connection rows for each new controller.</p><p><b>Lesson:</b> verify every new controller before you rely on it.</p></div>

<div class="iv"><p class="q">"In what order do you deploy the controllers, and why?"</p><p>Strong answer: Manager first because it holds the settings, the WAN edge list and handles the certificate requests; then the Validator so that the others and the edges have an entry point; then the Controller; then the edges. Say that you verify control connections between controllers before onboarding any edge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: Manager, Validator, Controller, then WAN edges.</li>
<li>Set organization name, Validator address and certificate method in the Manager first.</li>
<li>Add each controller to the Manager and install its certificate.</li>
<li>Verify the controller-to-controller connections before adding edges.</li>
<li>Edges talk to the Validator first, then to the Controller and the Manager.</li>
</ul></div>
`,hi:`
<p>Fabric banana naye bank branch kholne jaisa hai. Pehle head office rules aur stamp deta hai (Manager). Phir woh reception khulta hai jo visitors ko identify karta hai (Validator). Phir woh officers aate hain jo kaam tay aur route karte hain (Controller). Uske baad hi customers ko andar aane diya jaata hai (edges). Agar aap officers ke taiyaar hone se pehle customers ko andar aane do, to woh queue mein khade hokar shikayat karte hain. SD-WAN mein yahi sequence kai uljhan bhari adhuri-chalti states se bachata hai.</p>

<h3>Order aur har step ki wajah</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Onboarding order">
<rect x="10" y="20" width="140" height="95" rx="10" fill="#fde68a"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">1 Manager</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="10">settings, org name,</text><text x="80" y="76" text-anchor="middle" class="svg-muted" font-size="10">certificate method,</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="10">vbond address</text>
<rect x="170" y="20" width="140" height="95" rx="10" fill="#ddd6fe"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">2 Validator</text><text x="240" y="62" text-anchor="middle" class="svg-muted" font-size="10">Manager mein joda,</text><text x="240" y="76" text-anchor="middle" class="svg-muted" font-size="10">certificate,</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="10">edge list push</text>
<rect x="330" y="20" width="140" height="95" rx="10" fill="#bae6fd"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">3 Controller</text><text x="400" y="62" text-anchor="middle" class="svg-muted" font-size="10">Manager mein joda,</text><text x="400" y="76" text-anchor="middle" class="svg-muted" font-size="10">certificate,</text><text x="400" y="90" text-anchor="middle" class="svg-muted" font-size="10">OMP taiyaar</text>
<rect x="490" y="20" width="140" height="95" rx="10" fill="#bbf7d0"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">4 WAN edges</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="10">list mein Valid,</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="10">vbond tak pahunchte hain,</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="10">phir Controller, Manager</text>
<path d="M150 67 L170 67 M310 67 L330 67 M470 67 L490 67" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="140" width="580" height="75" rx="10" fill="#f1f5f9"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">Har step ke baad agla shuru karne se pehle check karo:</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="11">controllers aapas mein connected, certificates installed, list bheji, phir edges jodo.</text><text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="11">Ek baar mein ek badlav se koi bhi error dhoondhna aasan hota hai.</text>
</svg><p class="cap">Har step agle step ki zaroorat taiyaar karta hai.</p></div>
<table class="cmp"><tr><th>Step</th><th>Aap kya karte ho</th><th>Abhi kyun</th></tr>
<tr><td>1 Manager</td><td>Install, bootstrap, login. Settings mein organization name, Validator address aur certificate authorisation method daalo. Cisco PKI ho to Smart Account link karo.</td><td>Manager settings aur list rakhta hai. Woh doosron ke CSRs issue aur relay karta hai.</td></tr>
<tr><td>2 Validator</td><td>local vbond-only ke saath install aur bootstrap. Use Manager mein controller ke roop mein jodo, uska certificate lo, aur Manager WAN edge list push kar sakta hai.</td><td>Edges aur Controllers sab kuch Validator ke zariye dhoondhte hain.</td></tr>
<tr><td>3 Controller</td><td>Install aur bootstrap. Use Manager mein controller ke roop mein jodo, uska certificate lo. Woh Validator aur Manager se connect hota hai.</td><td>Edges accept karne se pehle use Validator aur certificate chahiye.</td></tr>
<tr><td>4 WAN edges</td><td>Devices ko list mein daalo aur Valid mark karo, list bhejo. Edge ko reachable Validator address ke saath power on karo.</td><td>Ab har dependency taiyaar hai.</td></tr></table>

<h3>Manager mein controllers jodna</h3>
<p>Manager ke controllers wale device configuration section mein aap Validator aur Controller ko ek ek karke jodte ho. Har ek ke liye device type, uska management ya VPN 0 IP address, aur login details dete ho jo Manager use reach karne ke liye use karega. CSR generate karne ka option select hota hai taaki Manager certificate request kar sake. Iske baad Manager device se connection kholta hai aur uska certificate manage karta hai. Manager ke paas apna certificate bhi hota hai.</p>

<h3>Verify karna ki controllers ek doosre ko dekhte hain</h3>
<p>Koi edge aane se pehle, controllers ko aapas mein control connections bana lene chahiye. Har ek par check karo.</p>
<pre class="out">VSMART# show control connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           PUBLIC
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     STATE
vbond   dtls  10.255.255.3  1     0       198.51.100.30  <span class="hl">up</span>
vmanage dtls  10.255.255.1  1     0       198.51.100.10  <span class="hl">up</span></pre>
<pre class="out">VMANAGE# show control connections
vbond   dtls  10.255.255.3  1     0       198.51.100.30  <span class="hl">up</span>
vsmart  dtls  10.255.255.2  1     1       198.51.100.20  <span class="hl">up</span></pre>
<p>Jab yeh rows up hon to teeno controllers ek doosre par trust karte hain aur fabric edges ke liye taiyaar hai. Agar koi row missing hai to abhi theek karo. Yeh dozens of branches ke beech wahi fault baad mein dhoondhne se bahut aasan hai.</p>

<h3>Edge ka apna sequence</h3>
<p>Sab kuch taiyaar hone par naya edge in steps se guzarta hai. Agla chapter har step ko detail mein dikhata hai.</p>
<ol>
<li>Edge ko VPN 0 mein address milta hai (DHCP ya static) aur default route.</li>
<li>Woh apne system block se Validator address resolve ya use karta hai.</li>
<li>Woh Validator se connect hota hai, authenticate karta hai aur Controller aur Manager ke addresses paata hai.</li>
<li>Woh Controller aur Manager se connect hota hai aur Validator connection chhod deta hai.</li>
<li>OMP shuru hota hai. Routes, TLOCs aur keys chalti hain.</li>
</ol>

<div class="eg"><p><b>Practice mein order.</b> Team pehle VMANAGE install karke login karti hai. Settings mein NK-LAB ko organization name aur 198.51.100.30 ko Validator ke roop mein daalti hai. Woh VBOND, phir VSMART ko controllers ke roop mein jodti hai, certificates install karti hai, aur confirm karti hai ki VMANAGE par do rows up hain. Woh E-DEL-1, E-MUM-1 aur E-BLR-1 ko valid ke roop mein list upload karti hai. Tabhi edges power on karti hai. Har router ek minute ke andar join ho jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Validator aur Controller ke taiyaar hone se pehle edges power on karna; ek session mein kai cheezein badalna jisse fault ki wajah saaf nahi hoti; Validator ke certificate se pehle Controller jodna; controllers jodne se pehle Manager mein organization name set karna bhoolna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Order hai Manager, Validator, Controller, phir WAN edges. Manager pehle isliye ki settings aur certificate requests wahin se shuru hote hain. Edge pehle Validator se baat karta hai, phir Controller aur Manager se.</p></div>

<div class="scn"><h4>Do Controllers, ek bhoola hua certificate</h4><p>Ek team ne live fabric mein do Controllers jode. Ek join hua; doosra agle din tak down raha. Jo edges use assign the woh sirf pehle se connect the, isliye kisi ko pata nahi chala jab tak maintenance window ne pehle ko hata nahi diya. Doosre Controller ka certificate kabhi install hi nahi hua tha. Incident ke baad runbook mein har naye controller ke liye chaar control-connection rows ka check jodha gaya.</p><p><b>Seekh:</b> kisi naye controller par bharosa karne se pehle use verify karo.</p></div>

<div class="iv"><p class="q">"Controllers kis order mein deploy karte ho, aur kyun?"</p><p>Strong answer: pehle Manager kyunki woh settings, WAN edge list rakhta hai aur certificate requests sambhalta hai; phir Validator taaki baaki aur edges ko entry point mile; phir Controller; phir edges. Kaho ki koi edge onboard karne se pehle controllers ke beech control connections verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: Manager, Validator, Controller, phir WAN edges.</li>
<li>Pehle Manager mein organization name, Validator address aur certificate method set karo.</li>
<li>Har controller ko Manager mein jodo aur uska certificate install karo.</li>
<li>Edges jodne se pehle controller-to-controller connections verify karo.</li>
<li>Edges pehle Validator se, phir Controller aur Manager se baat karte hain.</li>
</ul></div>
`}};export{e as default};