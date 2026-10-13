var e={id:`security-tenancy`,h:{en:`Security, tenancy, backup and disaster recovery`,hi:`Security, tenancy, backup aur disaster recovery`},body:{en:`
<p>Think of an apartment complex. There is a gate with a guard (perimeter), each tower has its own entrance (segmentation), each flat has its own lock (the workload), the society office keeps a list of who may enter which flat (access control), and there is a spare set of keys and important papers kept in a bank locker across town (backup and disaster recovery). Data center security follows the same idea: <b>defence in depth</b>, many independent layers, so one mistake is not a disaster.</p>

<h3>Layer 1: physical security (recap)</h3>
<p>From the facility chapter: fences, guards, mantraps, badge plus biometric, CCTV, locked cages and racks, escort logs. Remember that anyone with physical access to a switch's console port or a server's disks can bypass most software controls.</p>

<h3>Layer 2: network segmentation</h3>
<p><b>Segmentation</b> divides the network so that systems only reach what they need. Tools, from simple to advanced:</p>
<ul>
<li><b>VLANs and subnets</b> separate broadcast domains and IP ranges (web, app, database, management).</li>
<li><b>VRFs</b> (virtual routing and forwarding) create completely separate routing tables inside the same switch. Two VRFs cannot reach each other unless you deliberately leak routes or send traffic through a firewall. Different VRFs can even reuse the same IP ranges.</li>
<li><b>Tenants</b>: in a multitenant DC, each customer, business unit or environment (production, test) gets its own VRF, VLANs/VNIs and policies. In Cisco ACI, "tenant" is a formal object that contains VRFs, bridge domains and EPGs.</li>
</ul>
<pre class="code"><span class="c">! NX-OS: put the PROD web gateway into its own VRF</span>
vrf context PROD
interface Vlan10
  vrf member PROD
  ip address 10.10.10.1/24
  no shutdown</pre>
<pre class="out">LEAF-01# show vrf
VRF-Name                           VRF-ID State   Reason
default                                 1 Up      --
management                              2 Up      --
<span class="hl">PROD                                    3 Up      --</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two tenants separated by VRFs on shared switches">
<rect x="10" y="10" width="620" height="170" rx="10" fill="#e2e8f0"/><text x="20" y="30" class="svg-muted" font-size="12">One shared fabric</text>
<rect x="40" y="45" width="260" height="120" rx="8" fill="#bae6fd"/><text x="170" y="68" text-anchor="middle" class="svg-ink" font-size="14">Tenant A: VRF A</text>
<text x="170" y="95" text-anchor="middle" class="svg-ink" font-size="12">Web 10.1.1.0/24</text><text x="170" y="115" text-anchor="middle" class="svg-ink" font-size="12">DB 10.1.2.0/24</text>
<rect x="340" y="45" width="260" height="120" rx="8" fill="#bbf7d0"/><text x="470" y="68" text-anchor="middle" class="svg-ink" font-size="14">Tenant B: VRF B</text>
<text x="470" y="95" text-anchor="middle" class="svg-ink" font-size="12">Web 10.1.1.0/24</text><text x="470" y="115" text-anchor="middle" class="svg-ink" font-size="12">DB 10.1.2.0/24</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">same IPs, no route between them</text>
</svg><p class="cap">VRFs keep tenants apart on the same hardware, even with overlapping addresses.</p></div>

<h3>East-west firewalling and micro-segmentation</h3>
<p>Traditional firewalls sit at the edge and inspect north-south traffic. But attackers who get into one server usually move <b>sideways</b> (east-west) to the next. So modern DCs also control traffic <b>between</b> internal tiers:</p>
<ul>
<li><b>East-west firewalling</b>: traffic between zones or VRFs (for example web to database) is routed through a firewall, often attached to a service leaf.</li>
<li><b>Micro-segmentation</b>: policy applied per workload or group, not per subnet. Two VMs in the same subnet can still be blocked from talking. Examples: ACI EPGs and contracts, the VMware NSX distributed firewall, Cisco Secure Workload.</li>
</ul>
<p><b>Zero trust</b> is the idea behind this: never trust a connection just because it is "inside"; verify identity, allow only what is needed (<b>least privilege</b>), and log everything.</p>

<h3>Protecting the management plane</h3>
<p>Whoever controls your switches controls your data center. So:</p>
<ul>
<li><b>AAA</b> (authentication, authorization, accounting) with a central server. <b>TACACS+</b> (TCP 49) encrypts the whole packet and separates authorization so you can control and log every command; it is the usual choice for device administration. <b>RADIUS</b> (UDP 1812/1813) encrypts only the password and is common for network access.</li>
<li><b>RBAC</b> (role-based access control): operators get read-only roles (on NX-OS, <code>network-operator</code>), engineers get <code>network-admin</code> only when needed.</li>
<li>SSH only (no Telnet), access only from the management VRF and jump hosts, ACLs on management access, and a tested local break-glass account in case the AAA servers are unreachable.</li>
<li><b>Control-plane policing (CoPP)</b> protects the switch CPU from floods.</li>
</ul>
<pre class="code"><span class="c">! NX-OS: TACACS+ for logins and accounting, through the management VRF</span>
feature tacacs+
tacacs-server host 10.99.0.30 key Str0ngTacKey
aaa group server tacacs+ NOC-TACACS
  server 10.99.0.30
  use-vrf management
aaa authentication login default group NOC-TACACS
aaa accounting default group NOC-TACACS</pre>

<h3>Backup and disaster recovery</h3>
<p>Security also means being able to <b>recover</b>: from ransomware, a deleted database or the loss of a whole site. Two numbers drive every design:</p>
<ul>
<li><b>RPO</b> (recovery point objective): how much data, measured in time, you can afford to lose. An RPO of 15 minutes means copies at least every 15 minutes.</li>
<li><b>RTO</b> (recovery time objective): how long the service may be down before it must be running again.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="RPO and RTO on a timeline">
<line x1="20" y1="70" x2="620" y2="70" stroke="#64748b" stroke-width="2"/>
<circle cx="170" cy="70" r="6" fill="#bbf7d0"/><text x="170" y="50" text-anchor="middle" class="svg-ink" font-size="12">Last good copy</text>
<circle cx="330" cy="70" r="6" fill="#fed7aa"/><text x="330" y="50" text-anchor="middle" class="svg-ink" font-size="12">Disaster</text>
<circle cx="520" cy="70" r="6" fill="#bae6fd"/><text x="520" y="50" text-anchor="middle" class="svg-ink" font-size="12">Service back</text>
<text x="250" y="100" text-anchor="middle" class="svg-accent" font-size="13">RPO: data lost</text>
<text x="425" y="100" text-anchor="middle" class="svg-accent" font-size="13">RTO: downtime</text>
</svg><p class="cap">RPO looks backwards from the disaster; RTO looks forwards.</p></div>

<div class="eg"><p><b>Worked example.</b> Backups run every 4 hours: 00:00, 04:00, 08:00. Ransomware encrypts the database at 07:30. The last clean copy is 04:00, so 3.5 hours of data are lost (worst case with this schedule: nearly 4 hours, so the RPO is 4 hours). Restoring 2 TB at an effective 500 MB/s takes 2,000,000 ÷ 500 = 4,000 seconds, about 67 minutes, plus checks and start-up: an RTO of about 2 hours. If the business needs an RPO of 5 minutes, backups alone cannot do it; you need replication.</p></div>

<p>Good backup practice follows the <b>3-2-1 rule</b>: three copies, on two different media, one off-site, and today at least one <b>immutable</b> or offline copy that ransomware cannot encrypt.</p>
<p>For site loss, companies use a second data center:</p>
<ul>
<li><b>Active/standby</b>: the DR site waits, with data replicated to it. Simpler, but failover takes time and the standby capacity sits idle.</li>
<li><b>Active/active</b>: both sites serve users at the same time. Better use of money and faster recovery, but applications and networks are more complex.</li>
<li><b>Synchronous replication</b> gives an RPO of near zero, but latency limits it to short distances (typically up to about 100 km). <b>Asynchronous</b> replication works over any distance with an RPO of seconds to minutes.</li>
</ul>
<p><b>DCI</b> (data center interconnect) links the sites: dark fibre or DWDM, and on top of it technologies such as VXLAN EVPN Multi-Site or ACI Multi-Site. The golden rule: stretch only what you must, because a stretched Layer-2 domain also stretches failures.</p>

<div class="warn"><p><b>Common mistakes.</b> A flat "trusted inside" network where any server can reach any other. Shared admin accounts with no accounting. Backups that are never test-restored. Backup servers joined to the same domain and network the ransomware already controls.</p></div>
<div class="exam"><p><b>Exam tip.</b> TACACS+ = TCP 49, full-packet encryption, separate authorization, preferred for device admin; RADIUS = UDP 1812/1813, password-only encryption. RPO = acceptable data loss; RTO = acceptable downtime. VRFs = separate routing tables.</p></div>

<div class="scn"><h4>The contractor who could change everything</h4><p>An audit found that a contractor's account, meant only to read interface counters, had made configuration changes on three leaves. The switches used a local shared account with the network-admin role, and there was no accounting, so no one knew who typed what. The team moved every device to TACACS+ with command accounting, mapped the contractor group to the read-only network-operator role, restricted SSH to the jump hosts in the management VRF, and kept one sealed local break-glass account.</p><p><b>Lesson:</b> least privilege and accounting on the management plane are as important as firewalls on the data plane.</p></div>

<div class="iv"><p class="q">"Explain RPO and RTO with an example."</p><p>Strong answer: RPO is how much data you can afford to lose, measured back from the failure to the last good copy; RTO is how long you can be down before service is restored. Example: nightly backups give an RPO of up to 24 hours; if restore takes 3 hours, RTO is at least 3 hours. To reduce RPO use replication (synchronous for near zero over short distances, asynchronous for longer); to reduce RTO use standby or active/active sites and automation. Tie them to business requirements, not technology.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security is layered: physical, segmentation, workload policy, management plane, recovery.</li>
<li>VLANs split broadcast domains; VRFs split routing tables and form the base of tenants.</li>
<li>East-west firewalling and micro-segmentation stop lateral movement; zero trust means verify and allow the minimum.</li>
<li>Protect management with TACACS+ AAA, RBAC, SSH from the management VRF, accounting and a break-glass account.</li>
<li>RPO = data you can lose, RTO = time you can be down; 3-2-1 backups with an immutable copy; active/standby or active/active sites joined by DCI.</li>
</ul></div>
`,hi:`
<p>Ek apartment complex socho. Guard ke saath ek gate hai (perimeter), har tower ka apna entrance hai (segmentation), har flat ka apna tala hai (workload), society office ek list rakhta hai ki kaun kis flat mein ja sakta hai (access control), aur chaabiyon ka ek spare set aur zaroori kaagaz shehar ke dusre kone mein bank locker mein rakhe hain (backup aur disaster recovery). Data center security bhi isi idea ko follow karti hai: <b>defence in depth</b>, kai independent layers, taaki ek galti disaster na bane.</p>

<h3>Layer 1: physical security (recap)</h3>
<p>Facility chapter se: fences, guards, mantraps, badge plus biometric, CCTV, locked cages aur racks, escort logs. Yaad rakho ki jiske paas switch ke console port ya server ki disks tak physical access hai, woh zyada tar software controls ko bypass kar sakta hai.</p>

<h3>Layer 2: network segmentation</h3>
<p><b>Segmentation</b> network ko baant-ta hai taaki systems sirf wahi reach karein jo unhe chahiye. Tools, simple se advanced tak:</p>
<ul>
<li><b>VLANs aur subnets</b> broadcast domains aur IP ranges ko alag karte hain (web, app, database, management).</li>
<li><b>VRFs</b> (virtual routing and forwarding) ek hi switch ke andar poori tarah alag routing tables banate hain. Do VRFs ek dusre tak tab tak nahi pahunch sakte jab tak aap jaan-boojh kar routes leak na karo ya traffic firewall se na bhejo. Alag VRFs same IP ranges bhi reuse kar sakte hain.</li>
<li><b>Tenants</b>: multitenant DC mein har customer, business unit ya environment (production, test) ko apna VRF, VLANs/VNIs aur policies milti hain. Cisco ACI mein "tenant" ek formal object hai jismein VRFs, bridge domains aur EPGs hote hain.</li>
</ul>
<pre class="code"><span class="c">! NX-OS: PROD web gateway ko uske apne VRF mein daalo</span>
vrf context PROD
interface Vlan10
  vrf member PROD
  ip address 10.10.10.1/24
  no shutdown</pre>
<pre class="out">LEAF-01# show vrf
VRF-Name                           VRF-ID State   Reason
default                                 1 Up      --
management                              2 Up      --
<span class="hl">PROD                                    3 Up      --</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Shared switches par VRFs se alag do tenants">
<rect x="10" y="10" width="620" height="170" rx="10" fill="#e2e8f0"/><text x="20" y="30" class="svg-muted" font-size="12">Ek shared fabric</text>
<rect x="40" y="45" width="260" height="120" rx="8" fill="#bae6fd"/><text x="170" y="68" text-anchor="middle" class="svg-ink" font-size="14">Tenant A: VRF A</text>
<text x="170" y="95" text-anchor="middle" class="svg-ink" font-size="12">Web 10.1.1.0/24</text><text x="170" y="115" text-anchor="middle" class="svg-ink" font-size="12">DB 10.1.2.0/24</text>
<rect x="340" y="45" width="260" height="120" rx="8" fill="#bbf7d0"/><text x="470" y="68" text-anchor="middle" class="svg-ink" font-size="14">Tenant B: VRF B</text>
<text x="470" y="95" text-anchor="middle" class="svg-ink" font-size="12">Web 10.1.1.0/24</text><text x="470" y="115" text-anchor="middle" class="svg-ink" font-size="12">DB 10.1.2.0/24</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">same IPs, beech mein koi route nahi</text>
</svg><p class="cap">VRFs same hardware par tenants ko alag rakhte hain, overlapping addresses ke saath bhi.</p></div>

<h3>East-west firewalling aur micro-segmentation</h3>
<p>Traditional firewalls edge par baithte hain aur north-south traffic inspect karte hain. Lekin jo attacker ek server mein ghus jaata hai, woh aam taur par <b>side mein</b> (east-west) agle server tak jaata hai. Isliye modern DCs internal tiers ke <b>beech</b> ka traffic bhi control karte hain:</p>
<ul>
<li><b>East-west firewalling</b>: zones ya VRFs ke beech ka traffic (jaise web se database) ek firewall se route hota hai, jo aksar service leaf se juda hota hai.</li>
<li><b>Micro-segmentation</b>: policy har workload ya group par lagti hai, subnet par nahi. Same subnet ke do VMs ko bhi baat karne se roka ja sakta hai. Examples: ACI EPGs aur contracts, VMware NSX distributed firewall, Cisco Secure Workload.</li>
</ul>
<p>Iske peeche <b>zero trust</b> ka idea hai: kisi connection par sirf isliye bharosa mat karo ki woh "andar" hai; identity verify karo, sirf utna allow karo jitna zaroori hai (<b>least privilege</b>), aur sab kuch log karo.</p>

<h3>Management plane ko protect karna</h3>
<p>Jo aapke switches control karta hai, woh aapka data center control karta hai. Isliye:</p>
<ul>
<li>Central server ke saath <b>AAA</b> (authentication, authorization, accounting). <b>TACACS+</b> (TCP 49) poora packet encrypt karta hai aur authorization alag karta hai taaki aap har command control aur log kar sako; device administration ke liye yahi aam choice hai. <b>RADIUS</b> (UDP 1812/1813) sirf password encrypt karta hai aur network access ke liye common hai.</li>
<li><b>RBAC</b> (role-based access control): operators ko read-only roles milte hain (NX-OS par <code>network-operator</code>), engineers ko <code>network-admin</code> sirf zaroorat par.</li>
<li>Sirf SSH (Telnet nahi), access sirf management VRF aur jump hosts se, management access par ACLs, aur AAA servers unreachable hon to ek tested local break-glass account.</li>
<li><b>Control-plane policing (CoPP)</b> switch CPU ko floods se bachata hai.</li>
</ul>
<pre class="code"><span class="c">! NX-OS: logins aur accounting ke liye TACACS+, management VRF ke through</span>
feature tacacs+
tacacs-server host 10.99.0.30 key Str0ngTacKey
aaa group server tacacs+ NOC-TACACS
  server 10.99.0.30
  use-vrf management
aaa authentication login default group NOC-TACACS
aaa accounting default group NOC-TACACS</pre>

<h3>Backup aur disaster recovery</h3>
<p>Security ka matlab <b>recover</b> kar paana bhi hai: ransomware se, delete hue database se ya poori site khone se. Do numbers har design ko chalate hain:</p>
<ul>
<li><b>RPO</b> (recovery point objective): kitna data, time mein naapa hua, aap khona afford kar sakte ho. 15 minute RPO ka matlab kam se kam har 15 minute mein copies.</li>
<li><b>RTO</b> (recovery time objective): service kitni der down reh sakti hai us se pehle ki use wapas chalna hi padega.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Timeline par RPO aur RTO">
<line x1="20" y1="70" x2="620" y2="70" stroke="#64748b" stroke-width="2"/>
<circle cx="170" cy="70" r="6" fill="#bbf7d0"/><text x="170" y="50" text-anchor="middle" class="svg-ink" font-size="12">Aakhri achhi copy</text>
<circle cx="330" cy="70" r="6" fill="#fed7aa"/><text x="330" y="50" text-anchor="middle" class="svg-ink" font-size="12">Disaster</text>
<circle cx="520" cy="70" r="6" fill="#bae6fd"/><text x="520" y="50" text-anchor="middle" class="svg-ink" font-size="12">Service wapas</text>
<text x="250" y="100" text-anchor="middle" class="svg-accent" font-size="13">RPO: khoya data</text>
<text x="425" y="100" text-anchor="middle" class="svg-accent" font-size="13">RTO: downtime</text>
</svg><p class="cap">RPO disaster se peeche dekhta hai; RTO aage.</p></div>

<div class="eg"><p><b>Worked example.</b> Backups har 4 ghante chalte hain: 00:00, 04:00, 08:00. Ransomware 07:30 par database encrypt kar deta hai. Aakhri clean copy 04:00 ki hai, to 3.5 ghante ka data kho gaya (is schedule mein worst case: lagbhag 4 ghante, isliye RPO 4 ghante hai). 2 TB ko effective 500 MB/s par restore karne mein 2,000,000 ÷ 500 = 4,000 seconds lagte hain, lagbhag 67 minute, plus checks aur start-up: RTO lagbhag 2 ghante. Agar business ko 5 minute ka RPO chahiye, to sirf backups se nahi hoga; replication chahiye.</p></div>

<p>Achhi backup practice <b>3-2-1 rule</b> follow karti hai: teen copies, do alag media par, ek off-site, aur aaj kam se kam ek <b>immutable</b> ya offline copy jise ransomware encrypt na kar sake.</p>
<p>Site khone ki situation ke liye companies doosra data center use karti hain:</p>
<ul>
<li><b>Active/standby</b>: DR site wait karti hai, data us tak replicate hota hai. Simple, lekin failover mein time lagta hai aur standby capacity bekaar padi rehti hai.</li>
<li><b>Active/active</b>: dono sites ek saath users ko serve karti hain. Paise ka behtar use aur tez recovery, lekin applications aur networks zyada complex.</li>
<li><b>Synchronous replication</b> lagbhag zero RPO deta hai, lekin latency ise chhoti dooriyon tak limit karti hai (aam taur par lagbhag 100 km tak). <b>Asynchronous</b> replication kisi bhi doori par kaam karta hai, seconds se minutes ke RPO ke saath.</li>
</ul>
<p><b>DCI</b> (data center interconnect) sites ko jodta hai: dark fibre ya DWDM, aur uske upar VXLAN EVPN Multi-Site ya ACI Multi-Site jaisi technologies. Golden rule: sirf wahi stretch karo jo zaroori hai, kyunki stretched Layer-2 domain failures ko bhi stretch karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Flat "andar sab trusted" network jahan koi bhi server kisi bhi server tak pahunch sake. Shared admin accounts bina accounting ke. Backups jinka kabhi test-restore nahi hota. Backup servers jo usi domain aur network se jude hain jise ransomware pehle hi control kar raha hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> TACACS+ = TCP 49, full-packet encryption, alag authorization, device admin ke liye preferred; RADIUS = UDP 1812/1813, sirf password encryption. RPO = acceptable data loss; RTO = acceptable downtime. VRFs = alag routing tables.</p></div>

<div class="scn"><h4>Woh contractor jo sab kuch badal sakta tha</h4><p>Ek audit mein paaya gaya ki ek contractor ke account ne, jo sirf interface counters padhne ke liye tha, teen leaves par configuration changes kiye the. Switches network-admin role wala ek local shared account use karte the, aur koi accounting nahi thi, isliye kisi ko pata nahi tha ki kisne kya type kiya. Team ne har device ko command accounting ke saath TACACS+ par shift kiya, contractor group ko read-only network-operator role se map kiya, SSH ko management VRF ke jump hosts tak restrict kiya, aur ek sealed local break-glass account rakha.</p><p><b>Seekh:</b> management plane par least privilege aur accounting utne hi zaroori hain jitne data plane par firewalls.</p></div>

<div class="iv"><p class="q">"RPO aur RTO ko example ke saath samjhao."</p><p>Strong answer: RPO yeh hai ki aap kitna data khona afford kar sakte ho, failure se aakhri achhi copy tak peeche naapa hua; RTO yeh hai ki service restore hone se pehle aap kitni der down reh sakte ho. Example: nightly backups 24 ghante tak ka RPO dete hain; agar restore mein 3 ghante lagte hain, to RTO kam se kam 3 ghante hai. RPO kam karne ke liye replication use karo (chhoti doori par lagbhag zero ke liye synchronous, lambi doori ke liye asynchronous); RTO kam karne ke liye standby ya active/active sites aur automation. Inhe technology se nahi, business requirements se jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security layers mein hoti hai: physical, segmentation, workload policy, management plane, recovery.</li>
<li>VLANs broadcast domains baant-te hain; VRFs routing tables baant-te hain aur tenants ka base banate hain.</li>
<li>East-west firewalling aur micro-segmentation lateral movement rokte hain; zero trust ka matlab verify karo aur minimum allow karo.</li>
<li>Management ko TACACS+ AAA, RBAC, management VRF se SSH, accounting aur break-glass account se protect karo.</li>
<li>RPO = kitna data kho sakte ho, RTO = kitni der down reh sakte ho; immutable copy ke saath 3-2-1 backups; DCI se jude active/standby ya active/active sites.</li>
</ul></div>
`}};export{e as default};