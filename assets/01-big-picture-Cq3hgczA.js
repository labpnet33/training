var e={id:`big-picture`,h:{en:`The big picture: who controls the box that controls the network`,hi:`Big picture: us box ko kaun control karta hai jo network ko control karta hai`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>The three planes of every network device (data, control, management) and the tools that protect each one.</li>
<li>AAA for <b>device administration</b>: TACACS+ with Cisco ISE, method lists, local fallback, per-command authorization and accounting.</li>
<li>Secure monitoring and time: <b>SNMPv3</b> views, groups and users at noAuthNoPriv, authNoPriv and authPriv, and <b>authenticated NTP</b>.</li>
<li>Secure logging: severity levels, timestamps, exporting syslog, and the idea of syslog over TLS.</li>
<li>SSH hardening (version 2, key size, ciphers, timeouts, access-class), secure file transfer, and a <b>CIS benchmark</b> style audit.</li>
<li>A repeatable troubleshooting workflow for "admins cannot log in", plus a NOC turn-up checklist for a new device.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with the IOS CLI (modes, <code>show running-config</code>), IP addressing and basic ACLs. The CCNA hardening module and the ENCOR device-security module introduced local users, secret types and a first look at AAA; here we go to CCNP Security (SCOR 350-701) depth and add ISE, SNMPv3, NTP authentication and audits. The previous module, <b>Layer 2 attacks and defences</b>, protected the access ports; this one protects the devices themselves. The next modules move to Cisco ASA and Secure Firewall, where you will reuse everything here to manage firewalls safely.</p>

<h3>An analogy: the bank building</h3>
<p>Think of a router as a bank branch. Customers walking through the hall with deposits are the <b>data plane</b>: user traffic passing through. The branch manager who decides which counter serves whom, and who phones other branches to agree on routes for cash vans, is the <b>control plane</b>: routing protocols, ARP, STP. And the back office with the master keys, the CCTV recorder, the clock on the wall and the visitor register is the <b>management plane</b>: SSH, SNMP, NTP, syslog, AAA.</p>
<p>A thief who steals one deposit is a problem. A thief who walks into the back office with the master key owns the whole branch: he can open every vault, switch off the cameras and change the clock so the recordings prove nothing. That is why the management plane is the most valuable target on any network device, and why the SCOR blueprint gives it its own objectives.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Three planes and the management services">
<rect x="20" y="20" width="600" height="70" rx="10" fill="#ddd6fe"/>
<text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">Management plane</text>
<text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">SSH, AAA (TACACS+), SNMPv3, NTP, syslog, SCP</text>
<rect x="20" y="110" width="600" height="60" rx="10" fill="#bae6fd"/>
<text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">Control plane</text>
<text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="12">OSPF, BGP, ARP, STP  -  protected by CoPP and routing auth</text>
<rect x="20" y="190" width="600" height="60" rx="10" fill="#bbf7d0"/>
<text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="14">Data plane</text>
<text x="320" y="234" text-anchor="middle" class="svg-muted" font-size="12">user traffic  -  protected by ACLs, uRPF, L2 security</text>
<text x="320" y="285" text-anchor="middle" class="svg-accent" font-size="13">This module: mostly the top layer</text>
</svg><p class="cap">Every device has three planes. This module secures the management plane and points to the controls for the other two.</p></div>

<h3>The lab network you will use</h3>
<p>All five labs share one addressing plan so you can move between them without re-learning it:</p>
<table class="cmp">
<tr><th>Device</th><th>Role</th><th>Address</th></tr>
<tr><td>R1 (CORE in the NOC lab)</td><td>the device we harden</td><td>Gi0/0 10.10.10.1/24</td></tr>
<tr><td>ISE</td><td>TACACS+ server, key <code>NK-t4c-26</code></td><td>10.10.10.100</td></tr>
<tr><td>TIME</td><td>NTP server, stratum 3, key 1 <code>NK-Ntp-26</code></td><td>10.10.10.200</td></tr>
<tr><td>LOG</td><td>syslog collector</td><td>10.10.10.50</td></tr>
<tr><td>NMS / PC-ADMIN / ADMIN</td><td>SNMP poller and admin workstations</td><td>10.10.12.9, 10.10.11.9, 10.10.10.9</td></tr>
</table>
<p>The five labs follow the chapters: (1) TACACS+ device administration with command authorization, (2) a ticket where admins cannot log in via TACACS+, (3) SNMPv3 authPriv and authenticated NTP, (4) SSH hardening, secure syslog and a CIS audit, and (5) a NOC turn-up where you put everything together on a new device called CORE.</p>

<div class="eg"><p><b>Worked example.</b> A company has 40 routers and 6 network engineers. With one shared enable password, 6 people know one secret, it is typed on 40 boxes, and when an engineer leaves the password must be changed on all 40. Nobody can tell who ran <code>reload</code> last Tuesday. With TACACS+ on ISE, each engineer has a personal account, disabling one account takes one click, ISE records every command with a username and time, and the 40 routers only hold one emergency local account in a sealed envelope.</p></div>

<h3>Why this matters for the exam and the job</h3>
<p>SCOR 350-701 asks you to describe device hardening of network infrastructure (control, data and management plane, and routing protocol security), to configure and verify secure network management (SNMPv3 views, groups and users with authentication and encryption, secure logging, NTP with authentication), and to explain AAA with TACACS+ and RADIUS. In real jobs, auditors ask the same questions: who can log in, what can they change, is every change logged, and are the logs trustworthy? This module gives you the configuration and the vocabulary to answer.</p>

<div class="warn"><p><b>Common mistake.</b> Hardening the data plane with firewalls and ACLs, but leaving Telnet, SNMP community "public" and a shared enable password on the routers. Attackers who get into a management network go straight for these weak services, because they give control of the whole device.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Management plane" is not the same as "management interface". SSH arriving on any interface is management-plane traffic. The plane is about <b>what the traffic does</b> (manage the device), not which port it enters on.</p></div>

<div class="scn"><h4>The contractor who knew the password</h4><p>A retailer used one enable secret on every branch router. A contractor who had worked there two years earlier still knew it and logged in to "check something", causing an outage. Nobody could prove who changed the config, because every session showed only "vty0". The fix was TACACS+ with personal accounts, command accounting to ISE and a single local break-glass account whose password was rotated and stored in a vault.</p><p><b>Lesson:</b> shared passwords give no accountability and never really get revoked; centralised AAA fixes both.</p></div>

<div class="iv"><p class="q">"What are the three planes of a router, and which one would you protect first?"</p><p>Name them with examples: data plane forwards user traffic, control plane builds the tables (OSPF, BGP, ARP), management plane is how humans and tools manage the box (SSH, SNMP, NTP, syslog, AAA). Say that a compromised management plane gives full control of the other two, so it is secured first, and that CoPP protects the CPU that both control and management planes share.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every device has a data, a control and a management plane; each has its own protections.</li>
<li>The management plane is the highest-value target because it controls everything else.</li>
<li>This module covers AAA with TACACS+/ISE, SNMPv3, authenticated NTP, secure syslog, SSH hardening, secure file transfer and CIS audits.</li>
<li>All labs share R1 10.10.10.1, ISE 10.10.10.100, TIME 10.10.10.200 and LOG 10.10.10.50.</li>
<li>Personal accounts plus accounting replace shared passwords and give real accountability.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>Har network device ke teen planes (data, control, management) aur har ek ko protect karne wale tools.</li>
<li><b>Device administration</b> ke liye AAA: Cisco ISE ke saath TACACS+, method lists, local fallback, per-command authorization aur accounting.</li>
<li>Secure monitoring aur time: <b>SNMPv3</b> views, groups aur users noAuthNoPriv, authNoPriv aur authPriv par, aur <b>authenticated NTP</b>.</li>
<li>Secure logging: severity levels, timestamps, syslog export karna, aur TLS par syslog ka idea.</li>
<li>SSH hardening (version 2, key size, ciphers, timeouts, access-class), secure file transfer, aur <b>CIS benchmark</b> style audit.</li>
<li>"Admins login nahi kar pa rahe" ke liye ek repeatable troubleshooting workflow, plus naye device ke liye NOC turn-up checklist.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko IOS CLI (modes, <code>show running-config</code>), IP addressing aur basic ACLs mein comfortable hona chahiye. CCNA hardening module aur ENCOR device-security module ne local users, secret types aur AAA ki pehli jhalak di thi; yahan hum CCNP Security (SCOR 350-701) depth tak jaate hain aur ISE, SNMPv3, NTP authentication aur audits jodte hain. Pichhle module, <b>Layer 2 attacks aur defences</b>, ne access ports protect kiye the; yeh module devices ko khud protect karta hai. Agle modules Cisco ASA aur Secure Firewall par jaate hain, jahan aap yahan ka sab kuch firewalls ko safely manage karne mein dobara use karoge.</p>

<h3>Ek analogy: bank ki building</h3>
<p>Router ko ek bank branch samjho. Hall mein deposits ke saath chalne wale customers <b>data plane</b> hain: user traffic jo guzarta hai. Branch manager jo tay karta hai kaunsa counter kise serve kare, aur jo cash vans ke routes par doosri branches ko phone karta hai, woh <b>control plane</b> hai: routing protocols, ARP, STP. Aur back office jismein master keys, CCTV recorder, deewar ki ghadi aur visitor register hai, woh <b>management plane</b> hai: SSH, SNMP, NTP, syslog, AAA.</p>
<p>Ek chor jo ek deposit churata hai, woh ek problem hai. Par jo chor master key lekar back office mein ghus jaata hai, woh poori branch ka maalik ban jaata hai: woh har vault khol sakta hai, cameras band kar sakta hai aur ghadi badal sakta hai taaki recordings kuch sabit na karein. Isiliye management plane kisi bhi network device ka sabse keemti target hai, aur isiliye SCOR blueprint ise apne alag objectives deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Teen planes aur management services">
<rect x="20" y="20" width="600" height="70" rx="10" fill="#ddd6fe"/>
<text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">Management plane</text>
<text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">SSH, AAA (TACACS+), SNMPv3, NTP, syslog, SCP</text>
<rect x="20" y="110" width="600" height="60" rx="10" fill="#bae6fd"/>
<text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">Control plane</text>
<text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="12">OSPF, BGP, ARP, STP  -  CoPP aur routing auth se protected</text>
<rect x="20" y="190" width="600" height="60" rx="10" fill="#bbf7d0"/>
<text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="14">Data plane</text>
<text x="320" y="234" text-anchor="middle" class="svg-muted" font-size="12">user traffic  -  ACLs, uRPF, L2 security se protected</text>
<text x="320" y="285" text-anchor="middle" class="svg-accent" font-size="13">Yeh module: zyada tar upar wali layer</text>
</svg><p class="cap">Har device ke teen planes hote hain. Yeh module management plane secure karta hai aur baaki do ke controls ki taraf ishara karta hai.</p></div>

<h3>Lab network jo aap use karoge</h3>
<p>Paanchon labs ek hi addressing plan share karte hain taaki aap bina dobara seekhe unke beech ghoom sako:</p>
<table class="cmp">
<tr><th>Device</th><th>Role</th><th>Address</th></tr>
<tr><td>R1 (NOC lab mein CORE)</td><td>jis device ko hum harden karte hain</td><td>Gi0/0 10.10.10.1/24</td></tr>
<tr><td>ISE</td><td>TACACS+ server, key <code>NK-t4c-26</code></td><td>10.10.10.100</td></tr>
<tr><td>TIME</td><td>NTP server, stratum 3, key 1 <code>NK-Ntp-26</code></td><td>10.10.10.200</td></tr>
<tr><td>LOG</td><td>syslog collector</td><td>10.10.10.50</td></tr>
<tr><td>NMS / PC-ADMIN / ADMIN</td><td>SNMP poller aur admin workstations</td><td>10.10.12.9, 10.10.11.9, 10.10.10.9</td></tr>
</table>
<p>Paanch labs chapters ke saath chalte hain: (1) command authorization ke saath TACACS+ device administration, (2) ek ticket jahan admins TACACS+ se login nahi kar paate, (3) SNMPv3 authPriv aur authenticated NTP, (4) SSH hardening, secure syslog aur CIS audit, aur (5) NOC turn-up jahan aap CORE naam ke naye device par sab kuch jodte ho.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke paas 40 routers aur 6 network engineers hain. Ek shared enable password ke saath, 6 log ek secret jaante hain, woh 40 boxes par type hota hai, aur jab koi engineer chhodta hai to password 40 ke 40 par badalna padta hai. Koi nahi bata sakta ki pichhle Tuesday <code>reload</code> kisne chalaya. ISE par TACACS+ ke saath, har engineer ka personal account hai, ek account disable karna ek click hai, ISE har command username aur time ke saath record karta hai, aur 40 routers mein sirf ek emergency local account hota hai jiska password sealed envelope mein hai.</p></div>

<h3>Exam aur job ke liye yeh kyun zaroori hai</h3>
<p>SCOR 350-701 aapse network infrastructure ki device hardening (control, data aur management plane, aur routing protocol security) describe karne, secure network management (authentication aur encryption ke saath SNMPv3 views, groups aur users, secure logging, authentication ke saath NTP) configure aur verify karne, aur TACACS+ aur RADIUS ke saath AAA samjhane ko kehta hai. Real jobs mein auditors bhi yahi sawaal poochte hain: kaun login kar sakta hai, woh kya badal sakte hain, kya har change log hota hai, aur kya logs par bharosa kiya ja sakta hai? Yeh module aapko jawab dene ke liye configuration aur vocabulary deta hai.</p>

<div class="warn"><p><b>Common galti.</b> Data plane ko firewalls aur ACLs se harden karna, par routers par Telnet, SNMP community "public" aur shared enable password chhod dena. Jo attackers management network mein ghus jaate hain, woh seedhe in kamzor services par jaate hain, kyunki yeh poore device ka control deti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Management plane" aur "management interface" ek cheez nahi hain. Kisi bhi interface par aane wala SSH management-plane traffic hai. Plane is baare mein hai ki <b>traffic kya karta hai</b> (device manage karta hai), is baare mein nahi ki woh kis port se aata hai.</p></div>

<div class="scn"><h4>Woh contractor jise password pata tha</h4><p>Ek retailer har branch router par ek hi enable secret use karta tha. Ek contractor jo do saal pehle wahan kaam kar chuka tha, use abhi bhi password yaad tha aur usne "kuch check karne" ke liye login kiya, jisse outage hua. Koi sabit nahi kar paaya ki config kisne badla, kyunki har session sirf "vty0" dikhata tha. Fix tha personal accounts ke saath TACACS+, ISE ko command accounting, aur ek single local break-glass account jiska password rotate karke vault mein rakha gaya.</p><p><b>Seekh:</b> shared passwords koi accountability nahi dete aur sach mein kabhi revoke nahi hote; centralised AAA dono theek karta hai.</p></div>

<div class="iv"><p class="q">"Router ke teen planes kaunse hain, aur aap pehle kise protect karoge?"</p><p>Examples ke saath naam batao: data plane user traffic forward karta hai, control plane tables banata hai (OSPF, BGP, ARP), management plane woh hai jisse insaan aur tools box manage karte hain (SSH, SNMP, NTP, syslog, AAA). Kaho ki compromised management plane baaki dono ka poora control de deta hai, isliye woh pehle secure hota hai, aur CoPP us CPU ko protect karta hai jise control aur management dono planes share karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har device ka ek data, ek control aur ek management plane hota hai; har ek ke apne protections hain.</li>
<li>Management plane sabse keemti target hai kyunki woh baaki sab ko control karta hai.</li>
<li>Yeh module TACACS+/ISE ke saath AAA, SNMPv3, authenticated NTP, secure syslog, SSH hardening, secure file transfer aur CIS audits cover karta hai.</li>
<li>Saare labs R1 10.10.10.1, ISE 10.10.10.100, TIME 10.10.10.200 aur LOG 10.10.10.50 share karte hain.</li>
<li>Personal accounts plus accounting shared passwords ki jagah lete hain aur asli accountability dete hain.</li>
</ul></div>
`}};export{e as default};