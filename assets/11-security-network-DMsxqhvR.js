var e={id:`sec-network`,h:{en:`Securing the network: AAA, RBAC, CoPP, first-hop security and link protection`,hi:`Network secure karna: AAA, RBAC, CoPP, first-hop security aur link protection`},body:{en:`
<p>Think of an office building. The front desk checks your ID (<b>authentication</b>), your badge only opens the floors you work on (<b>authorization</b>), and every door you open is logged (<b>accounting</b>). The lifts limit how many people ride at once so nobody overloads them (<b>CoPP</b>), and guards on each floor make sure visitors are who their badge says (<b>first-hop security</b>). A data center switch needs the same layers. This chapter covers them and walks through the Lab 4 ticket about a contractor account that could change the switch.</p>

<h3>AAA with TACACS+ or RADIUS</h3>
<p>Local accounts on hundreds of switches are impossible to manage well. <b>AAA</b> moves logins to a central server such as Cisco ISE. <b>TACACS+</b> (TCP 49) encrypts the whole payload and separates authentication, authorization and accounting, so it is preferred for device administration and per-command authorization. <b>RADIUS</b> (UDP 1812/1813) encrypts only the password and combines authentication and authorization; it is the usual choice for network access such as 802.1X.</p>
<pre class="code">feature tacacs+
tacacs-server host 10.99.0.30 key 0 T4cacs!Key
aaa group server tacacs+ ISE
  server 10.99.0.30
  use-vrf management
  source-interface mgmt0
aaa authentication login default group ISE
aaa authorization commands default group ISE local
aaa accounting default group ISE</pre>
<p>If every TACACS+ server is unreachable, NX-OS falls back to local accounts by default, so keep one strong local break-glass account. The server tells the switch which NX-OS role a user gets with the attribute <code>shell:roles="network-operator"</code> (a TACACS+ shell profile or a RADIUS cisco-av-pair).</p>

<h3>RBAC: roles decide what a user may do</h3>
<p>NX-OS has built-in roles: <b>network-admin</b> (read and write everything) and <b>network-operator</b> (read-only; can run show commands, cannot enter configuration mode). A new user created without a role gets network-operator. You can also create <b>custom roles</b> with up to 256 rules; rules are checked from the <b>highest number down</b>, and the first match wins.</p>
<pre class="code">role name NOC-L1
  rule 30 deny command show running-config
  rule 20 permit read-write feature vlan
  rule 10 permit read
  vlan policy deny
    permit vlan 100-199</pre>
<p>This role can read everything except the running configuration, and can change only VLANs 100 to 199. <code>show role feature</code> lists feature names you can use in rules. The most important RBAC fact for Lab 4: a user can hold <b>several roles</b>, and the permissions <b>add up</b>. The command <code>username X role Y</code> on an existing user <b>adds</b> role Y; it does not replace the old one.</p>

<h3>Lab 4: the contractor who could configure</h3>
<p>The audit says vendor1 should be read-only, yet it changed an interface. List the accounts:</p>
<pre class="out">LEAF1# show user-account
user:admin
        this user account has no expiry date
        roles:network-admin

user:vendor1
        this user account has no expiry date
        <span class="hl">roles:network-operator network-admin</span></pre>
<p>Someone ran <code>username vendor1 role network-admin</code>, probably for a one-time task, and never removed it. Remove exactly that role, keeping the account and its password:</p>
<pre class="code">LEAF1(config)# no username vendor1 role network-admin
LEAF1(config)# end
LEAF1# show user-account</pre>
<p>Then prove it from the contractor's point of view: from NOC-PC, SSH to 10.10.10.1 as vendor1. <code>show running-config | include username</code> works, but configuration mode is refused:</p>
<pre class="out">LEAF1# configure terminal
<span class="hl">% Permission denied for the role</span></pre>
<p>Finally save on the console with <code>copy running-config startup-config</code>. With TACACS+ in production, the same fix would be made on the server's shell profile, and the accounting log shows who ran which command.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Layers of switch protection">
<rect x="10" y="10" width="620" height="32" rx="6" fill="#ddd6fe"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Management plane: SSH only, AAA, RBAC, management VRF and ACL</text>
<rect x="10" y="50" width="620" height="32" rx="6" fill="#bae6fd"/><text x="320" y="71" text-anchor="middle" class="svg-ink" font-size="13">Control plane: CoPP, routing protocol authentication with keychains</text>
<rect x="10" y="90" width="620" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="111" text-anchor="middle" class="svg-ink" font-size="13">Access edge: DHCP snooping, DAI, IP source guard, port security, 802.1X</text>
<rect x="10" y="130" width="620" height="32" rx="6" fill="#fde68a"/><text x="320" y="151" text-anchor="middle" class="svg-ink" font-size="13">Links: MACsec encryption between switches</text>
</svg><p class="cap">Protect who can manage the switch, what can reach its CPU, what hosts can claim, and what travels on the links.</p></div>

<h3>CoPP: protecting the supervisor CPU</h3>
<p>The switch forwards user traffic in hardware, but control traffic (OSPF, BGP, ARP, SSH, ICMP to the switch) goes to the CPU. A flood of such packets, from an attack or a loop, could starve routing protocols. <b>Control Plane Policing (CoPP)</b> classifies CPU-bound traffic and rate-limits each class. NX-OS applies a default profile at first setup; the profiles are <b>strict</b>, <b>moderate</b>, <b>lenient</b> and <b>dense</b>.</p>
<pre class="out">LEAF1# show copp status
Last Config Operation: None
<span class="hl">Copp Profile: strict</span></pre>
<p><code>show policy-map interface control-plane</code> shows transmitted and dropped bytes per class; growing drops in a class tell you what is attacking or looping.</p>

<h3>First-hop security, port security and storm control</h3>
<pre class="code">feature dhcp
ip dhcp snooping
ip dhcp snooping vlan 10
ip arp inspection vlan 10
interface Ethernet1/49
  ip dhcp snooping trust
  ip arp inspection trust
interface Ethernet1/5
  ip verify source dhcp-snooping-vlan
  storm-control broadcast level 1.00</pre>
<ul>
<li><b>DHCP snooping</b> allows DHCP server replies only on trusted ports and builds a binding table (MAC, IP, VLAN, port).</li>
<li><b>Dynamic ARP Inspection (DAI)</b> drops ARP replies that do not match the binding table, stopping ARP spoofing.</li>
<li><b>IP Source Guard</b> drops IP traffic whose source does not match the binding for that port.</li>
<li><b>Port security</b> (<code>feature port-security</code>, <code>switchport port-security maximum 2</code>) limits MAC addresses per port; violation modes are shutdown, restrict and protect.</li>
<li><b>Storm control</b> caps broadcast, multicast or unknown unicast as a percentage of bandwidth.</li>
</ul>

<h3>802.1X, MACsec and keychains, at concept level</h3>
<p><b>802.1X</b> (<code>feature dot1x</code>) makes a device authenticate through RADIUS before its port forwards traffic. <b>MACsec</b> (IEEE 802.1AE, <code>feature macsec</code>) encrypts traffic hop by hop on a link, typically between switches or across a DCI, using keys from a <b>key chain</b> (for example AES-256 cipher suites). Key chains also hold the rotating keys for routing protocol authentication, such as <code>ip ospf authentication key-chain OSPF-KEYS</code>, with send and accept lifetimes so keys can roll over without an outage.</p>

<div class="eg"><p><b>Worked example: rule order.</b> Role NOC-L1 has rule 30 (deny show running-config), rule 20 (permit read-write feature vlan) and rule 10 (permit read). A user runs <code>show running-config</code>: rule 30 matches first and denies it. They run <code>show vlan brief</code>: rule 30 does not match, rule 20 does (it is VLAN feature data), so it is allowed. They try to create VLAN 250: rule 20 permits the VLAN feature, but the VLAN policy only permits 100 to 199, so it is denied.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adding a role "temporarily" and forgetting that roles add up. Deleting and recreating a user instead of removing one role (which loses the password and history). No local break-glass account when TACACS+ fails. Trusting access ports for DHCP snooping. Enabling DAI on a VLAN with static-IP servers and no ARP ACL or static bindings, so they lose connectivity.</p></div>
<div class="exam"><p><b>Exam trap.</b> TACACS+ = TCP 49, full encryption, separate AAA functions; RADIUS = UDP 1812/1813, password-only encryption. Built-in roles: network-admin and network-operator; roles are cumulative; custom rules are evaluated highest number first. CoPP protects the CPU; DAI and IP Source Guard depend on DHCP snooping.</p></div>

<div class="scn"><h4>The contractor account that could change the switch</h4><p>An internal audit found that account vendor1, meant to be read-only for a monitoring contractor, had shut an interface during a maintenance weekend. The engineer ran <code>show user-account</code> and saw roles network-operator and network-admin. The accounting log showed that months earlier someone had added network-admin for a firmware task. She removed only that role with <code>no username vendor1 role network-admin</code>, logged in as vendor1 over SSH to confirm "Permission denied for the role" in configuration mode, saved, and opened a change to move contractor accounts to TACACS+ with time-limited roles.</p><p><b>Lesson:</b> check the full role list, fix with least privilege, and prove the fix from the user's point of view.</p></div>

<div class="iv"><p class="q">"How does RBAC work on NX-OS, and how would you give a NOC team limited rights?"</p><p>Strong answer: users have one or more roles and permissions are the union; network-admin is full access, network-operator read-only and the default for new users. For a NOC I would create a custom role with rules (evaluated from the highest number) such as permit read plus read-write on specific features, and interface or VLAN policies to limit scope, then assign it from TACACS+ with <code>shell:roles</code>. Mention verifying with <code>show user-account</code> and testing as the user.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA centralises logins; TACACS+ for device admin (TCP 49), RADIUS for network access and 802.1X.</li>
<li>NX-OS roles are cumulative; <code>username X role Y</code> adds a role; remove one with <code>no username X role Y</code>.</li>
<li>Custom roles: up to 256 rules, highest number first, plus interface, VLAN and VRF policies.</li>
<li>CoPP rate-limits CPU-bound traffic with strict, moderate, lenient or dense profiles.</li>
<li>DHCP snooping, DAI, IP Source Guard, port security, storm control, 802.1X and MACsec protect the edge and links.</li>
</ul></div>
`,hi:`
<p>Ek office building ke baare mein socho. Front desk aapki ID check karta hai (<b>authentication</b>), aapka badge sirf un floors ko kholta hai jahan aap kaam karte ho (<b>authorization</b>), aur aap jo bhi darwaza kholte ho woh log hota hai (<b>accounting</b>). Lifts limit karti hain ki ek baar mein kitne log chadhein taaki overload na ho (<b>CoPP</b>), aur har floor ke guards dekhte hain ki visitors wahi hain jo unka badge kehta hai (<b>first-hop security</b>). Data center switch ko yahi layers chahiye. Yeh chapter unhe cover karta hai aur Lab 4 ka ticket samjhata hai jismein ek contractor account switch badal sakta tha.</p>

<h3>TACACS+ ya RADIUS ke saath AAA</h3>
<p>Sainkdon switches par local accounts achhi tarah manage karna namumkin hai. <b>AAA</b> logins ko Cisco ISE jaise central server par le jaata hai. <b>TACACS+</b> (TCP 49) poora payload encrypt karta hai aur authentication, authorization aur accounting ko alag rakhta hai, isliye device administration aur per-command authorization ke liye pasand kiya jaata hai. <b>RADIUS</b> (UDP 1812/1813) sirf password encrypt karta hai aur authentication aur authorization ko jodta hai; 802.1X jaise network access ke liye yahi aam choice hai.</p>
<pre class="code">feature tacacs+
tacacs-server host 10.99.0.30 key 0 T4cacs!Key
aaa group server tacacs+ ISE
  server 10.99.0.30
  use-vrf management
  source-interface mgmt0
aaa authentication login default group ISE
aaa authorization commands default group ISE local
aaa accounting default group ISE</pre>
<p>Agar har TACACS+ server unreachable ho, NX-OS default mein local accounts par fall back karta hai, isliye ek strong local break-glass account rakho. Server switch ko batata hai ki user ko kaunsa NX-OS role milega attribute <code>shell:roles="network-operator"</code> se (TACACS+ shell profile ya RADIUS cisco-av-pair).</p>

<h3>RBAC: roles tay karte hain ki user kya kar sakta hai</h3>
<p>NX-OS ke built-in roles hain: <b>network-admin</b> (sab kuch read aur write) aur <b>network-operator</b> (read-only; show commands chala sakta hai, configuration mode mein nahi ja sakta). Bina role ke bane naye user ko network-operator milta hai. Aap 256 tak rules wale <b>custom roles</b> bhi bana sakte ho; rules <b>sabse bade number se neeche</b> check hote hain, aur pehla match jeetta hai.</p>
<pre class="code">role name NOC-L1
  rule 30 deny command show running-config
  rule 20 permit read-write feature vlan
  rule 10 permit read
  vlan policy deny
    permit vlan 100-199</pre>
<p>Yeh role running configuration ke alawa sab padh sakta hai, aur sirf VLANs 100 se 199 badal sakta hai. <code>show role feature</code> woh feature names list karta hai jo aap rules mein use kar sakte ho. Lab 4 ke liye sabse zaroori RBAC fact: ek user ke <b>kai roles</b> ho sakte hain, aur permissions <b>judti hain</b>. Maujooda user par command <code>username X role Y</code> role Y <b>jodta</b> hai; purane ko replace nahi karta.</p>

<h3>Lab 4: contractor jo configure kar sakta tha</h3>
<p>Audit kehta hai vendor1 read-only hona chahiye, phir bhi usne ek interface badla. Accounts list karo:</p>
<pre class="out">LEAF1# show user-account
user:admin
        this user account has no expiry date
        roles:network-admin

user:vendor1
        this user account has no expiry date
        <span class="hl">roles:network-operator network-admin</span></pre>
<p>Kisi ne <code>username vendor1 role network-admin</code> chalaya tha, shayad ek baar ke kaam ke liye, aur kabhi hataya nahi. Account aur uska password rakhte hue bilkul wahi role hatao:</p>
<pre class="code">LEAF1(config)# no username vendor1 role network-admin
LEAF1(config)# end
LEAF1# show user-account</pre>
<p>Phir contractor ki nazar se saabit karo: NOC-PC se vendor1 ke roop mein 10.10.10.1 par SSH karo. <code>show running-config | include username</code> chalta hai, lekin configuration mode mana ho jaata hai:</p>
<pre class="out">LEAF1# configure terminal
<span class="hl">% Permission denied for the role</span></pre>
<p>Aakhir mein console par <code>copy running-config startup-config</code> se save karo. Production mein TACACS+ ke saath yahi fix server ke shell profile par hota, aur accounting log dikhata hai ki kisne kaunsa command chalaya.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Switch protection ki layers">
<rect x="10" y="10" width="620" height="32" rx="6" fill="#ddd6fe"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Management plane: sirf SSH, AAA, RBAC, management VRF aur ACL</text>
<rect x="10" y="50" width="620" height="32" rx="6" fill="#bae6fd"/><text x="320" y="71" text-anchor="middle" class="svg-ink" font-size="13">Control plane: CoPP, keychains ke saath routing protocol authentication</text>
<rect x="10" y="90" width="620" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="111" text-anchor="middle" class="svg-ink" font-size="13">Access edge: DHCP snooping, DAI, IP source guard, port security, 802.1X</text>
<rect x="10" y="130" width="620" height="32" rx="6" fill="#fde68a"/><text x="320" y="151" text-anchor="middle" class="svg-ink" font-size="13">Links: switches ke beech MACsec encryption</text>
</svg><p class="cap">Bachao ki switch kaun manage kar sakta hai, uske CPU tak kya pahunch sakta hai, hosts kya claim kar sakte hain, aur links par kya jaata hai.</p></div>

<h3>CoPP: supervisor CPU ko bachana</h3>
<p>Switch user traffic hardware mein forward karta hai, lekin control traffic (OSPF, BGP, ARP, SSH, switch ko ICMP) CPU par jaata hai. Aise packets ka flood, attack ya loop se, routing protocols ko bhookha maar sakta hai. <b>Control Plane Policing (CoPP)</b> CPU-bound traffic ko classify karta hai aur har class ko rate-limit karta hai. NX-OS first setup par default profile lagata hai; profiles hain <b>strict</b>, <b>moderate</b>, <b>lenient</b> aur <b>dense</b>.</p>
<pre class="out">LEAF1# show copp status
Last Config Operation: None
<span class="hl">Copp Profile: strict</span></pre>
<p><code>show policy-map interface control-plane</code> har class ke transmitted aur dropped bytes dikhata hai; kisi class mein badhte drops batate hain ki kya attack ya loop kar raha hai.</p>

<h3>First-hop security, port security aur storm control</h3>
<pre class="code">feature dhcp
ip dhcp snooping
ip dhcp snooping vlan 10
ip arp inspection vlan 10
interface Ethernet1/49
  ip dhcp snooping trust
  ip arp inspection trust
interface Ethernet1/5
  ip verify source dhcp-snooping-vlan
  storm-control broadcast level 1.00</pre>
<ul>
<li><b>DHCP snooping</b> DHCP server replies sirf trusted ports par allow karta hai aur binding table (MAC, IP, VLAN, port) banata hai.</li>
<li><b>Dynamic ARP Inspection (DAI)</b> woh ARP replies drop karta hai jo binding table se match nahi karte, ARP spoofing rokta hai.</li>
<li><b>IP Source Guard</b> woh IP traffic drop karta hai jiska source us port ki binding se match nahi karta.</li>
<li><b>Port security</b> (<code>feature port-security</code>, <code>switchport port-security maximum 2</code>) har port par MAC addresses limit karta hai; violation modes shutdown, restrict aur protect hain.</li>
<li><b>Storm control</b> broadcast, multicast ya unknown unicast ko bandwidth ke percentage par cap karta hai.</li>
</ul>

<h3>802.1X, MACsec aur keychains, concept level par</h3>
<p><b>802.1X</b> (<code>feature dot1x</code>) device ko port par traffic forward hone se pehle RADIUS ke through authenticate karwata hai. <b>MACsec</b> (IEEE 802.1AE, <code>feature macsec</code>) link par hop by hop traffic encrypt karta hai, aam taur par switches ke beech ya DCI ke paar, <b>key chain</b> ki keys se (jaise AES-256 cipher suites). Key chains routing protocol authentication ki rotating keys bhi rakhti hain, jaise <code>ip ospf authentication key-chain OSPF-KEYS</code>, send aur accept lifetimes ke saath taaki keys bina outage ke roll over ho sakein.</p>

<div class="eg"><p><b>Worked example: rule order.</b> Role NOC-L1 mein rule 30 (deny show running-config), rule 20 (permit read-write feature vlan) aur rule 10 (permit read) hain. User <code>show running-config</code> chalata hai: rule 30 pehle match karta hai aur deny karta hai. Woh <code>show vlan brief</code> chalata hai: rule 30 match nahi karta, rule 20 karta hai (yeh VLAN feature data hai), isliye allowed. Woh VLAN 250 banane ki koshish karta hai: rule 20 VLAN feature permit karta hai, lekin VLAN policy sirf 100 se 199 permit karti hai, isliye deny.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Role "temporarily" jodna aur bhool jaana ki roles judte hain. Ek role hatane ki jagah user delete karke dobara banana (jisse password aur history chali jaati hai). TACACS+ fail hone par koi local break-glass account na hona. DHCP snooping ke liye access ports ko trust karna. Static-IP servers wale VLAN par bina ARP ACL ya static bindings ke DAI enable karna, jisse unki connectivity chali jaati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> TACACS+ = TCP 49, poora encryption, alag AAA functions; RADIUS = UDP 1812/1813, sirf password encryption. Built-in roles: network-admin aur network-operator; roles cumulative hain; custom rules sabse bade number se evaluate hote hain. CoPP CPU bachata hai; DAI aur IP Source Guard DHCP snooping par depend karte hain.</p></div>

<div class="scn"><h4>Contractor account jo switch badal sakta tha</h4><p>Internal audit ne paaya ki account vendor1, jo monitoring contractor ke liye read-only hona tha, ne maintenance weekend ke dauraan ek interface shut kiya tha. Engineer ne <code>show user-account</code> chalaya aur roles network-operator aur network-admin dekhe. Accounting log ne dikhaya ki mahino pehle kisi ne firmware task ke liye network-admin joda tha. Usne <code>no username vendor1 role network-admin</code> se sirf woh role hataya, SSH par vendor1 ban kar login kiya aur configuration mode mein "Permission denied for the role" confirm kiya, save kiya, aur contractor accounts ko time-limited roles ke saath TACACS+ par le jaane ka change khola.</p><p><b>Seekh:</b> poori role list check karo, least privilege se fix karo, aur fix ko user ki nazar se saabit karo.</p></div>

<div class="iv"><p class="q">"NX-OS par RBAC kaise kaam karta hai, aur NOC team ko limited rights kaise doge?"</p><p>Strong answer: users ke ek ya zyada roles hote hain aur permissions ka union milta hai; network-admin full access hai, network-operator read-only aur naye users ka default. NOC ke liye main rules ke saath custom role banaunga (sabse bade number se evaluate), jaise permit read plus specific features par read-write, aur scope limit karne ke liye interface ya VLAN policies, phir TACACS+ se <code>shell:roles</code> ke saath assign karunga. <code>show user-account</code> se verify karna aur user ban kar test karna batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AAA logins centralise karta hai; device admin ke liye TACACS+ (TCP 49), network access aur 802.1X ke liye RADIUS.</li>
<li>NX-OS roles cumulative hain; <code>username X role Y</code> role jodta hai; <code>no username X role Y</code> se ek hatao.</li>
<li>Custom roles: 256 tak rules, sabse bada number pehle, plus interface, VLAN aur VRF policies.</li>
<li>CoPP strict, moderate, lenient ya dense profiles ke saath CPU-bound traffic rate-limit karta hai.</li>
<li>DHCP snooping, DAI, IP Source Guard, port security, storm control, 802.1X aur MACsec edge aur links bachate hain.</li>
</ul></div>
`}};export{e as default};