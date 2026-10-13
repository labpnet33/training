var e={id:`welcome`,h:{en:`Welcome: from factory default to a working edge firewall`,hi:`Welcome: factory default se working edge firewall tak`},body:{en:`
<p><b>What you will learn in this module.</b> You will take a FortiGate from factory state to a working edge firewall at a branch office: learn how the FortiOS CLI edits configuration tables, name the device, address its interfaces, decide which interfaces answer ping and administrator logins, add a default route, permit the first traffic, and troubleshoot the classic "I cannot open the GUI" ticket. These are the deployment and system configuration objectives of the FortiOS Administrator exam, and the habits you will use on every FortiGate.</p>
<p><b>Prerequisites.</b> Finish the free module <b>nse4-start</b> first (sessions, policies, NAT in plain words). From CCNA you need subnetting, the idea of a default gateway and a static route. No Fortinet experience is required.</p>
<h3>Analogy: opening a new shop</h3>
<p>A new shop gets keys, a street number, a signboard and a rule about who may enter the back office. A new FortiGate is the same. <b>Hostname</b> is the signboard. <b>Interface addresses</b> are the street numbers on each door. The <b>default route</b> is the road out to the city. <b>allowaccess</b> decides which doors the staff entrance (admin services) is on. Only after those basics do you write the house rules, the firewall policies.</p>
<h3>The five-step bring-up</h3>
<ol>
<li><b>Name it.</b> <code>config system global</code>, <code>set hostname</code>.</li>
<li><b>Address it.</b> LAN and WAN interfaces with IP, alias and role.</li>
<li><b>Secure management.</b> Only the right services on the right interfaces.</li>
<li><b>Route it.</b> A default route through the ISP.</li>
<li><b>Permit and verify.</b> A first policy, then test with ping, the routing table and the session list.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="The lab topology used by this module"><rect x="5" y="70" width="100" height="55" rx="9" fill="#e2e8f0"/><text x="55" y="94.5" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="55" y="111.5" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.10</text><line x1="105" y1="97" x2="150" y2="97" stroke="#64748b" stroke-width="2"/><text x="127" y="90" text-anchor="middle" class="svg-accent" font-size="11">port2</text><rect x="150" y="50" width="150" height="95" rx="9" fill="#fde68a"/><text x="225" y="94.5" text-anchor="middle" class="svg-ink" font-size="13">FGT1</text><text x="225" y="111.5" text-anchor="middle" class="svg-muted" font-size="11">NK-PUNE-FGT</text><line x1="300" y1="97" x2="350" y2="97" stroke="#64748b" stroke-width="2"/><text x="325" y="90" text-anchor="middle" class="svg-accent" font-size="11">port1</text><rect x="350" y="70" width="110" height="55" rx="9" fill="#ddd6fe"/><text x="405" y="94.5" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="405" y="111.5" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.1</text><line x1="460" y1="97" x2="505" y2="97" stroke="#64748b" stroke-width="2"/><rect x="505" y="70" width="130" height="55" rx="9" fill="#bbf7d0"/><text x="570" y="94.5" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV</text><text x="570" y="111.5" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8</text><text x="225" y="170" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.0.1.0/24 on port2, WAN 203.0.113.0/30 on port1</text></svg><p class="cap">The lab topology used by this module</p></div>
<h3>The lab devices and addressing</h3>
<table class="cmp"><tr><th>Device</th><th>Interface</th><th>Address</th></tr>
<tr><td>FGT1 (NK-PUNE-FGT)</td><td>port2 (LAN)</td><td>10.0.1.1/24</td></tr>
<tr><td>FGT1</td><td>port1 (WAN)</td><td>203.0.113.2/30</td></tr>
<tr><td>ISP</td><td>GigabitEthernet0/0</td><td>203.0.113.1/30</td></tr>
<tr><td>INET-SRV</td><td>eth0</td><td>8.8.8.8/24, gateway 8.8.8.1</td></tr>
<tr><td>PC1</td><td>eth0</td><td>10.0.1.10/24, gateway 10.0.1.1</td></tr></table>
<p>The module has two labs: <b>Factory default to first packet</b> (build everything above on a blank firewall) and <b>Ticket: the GUI will not open</b> (a troubleshooting ticket NK-7713). Chapters 2 to 7 teach what the first lab needs; chapter 8 walks the ticket.</p>
<div class="eg"><p><b>Worked example.</b> The brief says "allow ping, HTTPS and SSH on the LAN and ping only on the WAN". That one sentence becomes four settings: port2 role lan with allowaccess ping h&#116;tps ssh, and port1 role wan with allowaccess ping. Translating a sentence of intent into exact settings is the skill this module trains.</p></div>
<div class="warn"><p><b>Common mistake.</b> Starting with the firewall policy before the basics. Without correct interface addresses and a route, no policy can help, and you will chase the wrong layer.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam expects you to know what is configured in <code>config system global</code> (hostname, admin ports, timeouts) versus <code>config system interface</code> (addresses, allowaccess) versus <code>config router static</code> (routes).</p></div>
<div class="scn"><h4>The branch that went live in 40 minutes</h4><p>A new branch needed internet by noon. The engineer used the five-step order: hostname, interfaces, management access, default route, first policy. After each step he tested one thing (ping the LAN gateway, ping the ISP, ping 8.8.8.8 from the firewall, then from a PC). When a step failed he knew exactly which layer to blame, and the branch went live with an hour to spare.</p><p><b>Lesson:</b> a fixed order with a test after each step finds faults early.</p></div>
<div class="iv"><p class="q">"What would you configure first on a brand-new FortiGate?"</p><p>Hostname, then the LAN interface address and administrative access so I can manage it, then the WAN interface, then the default route, then the first policy with NAT. I test after each step. I also change the default admin credentials and restrict who can administer the device.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bring-up order: name, address, secure management, route, permit and verify.</li>
<li>Settings live in three places: system global, system interface, router static.</li>
<li>The module has two labs: first packet and the GUI ticket.</li>
<li>Test after every step to find faults early.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap FortiGate ko factory state se branch office ke working edge firewall tak le jaoge: FortiOS CLI configuration tables ko kaise edit karta hai, device ko naam dena, interfaces ko address dena, tay karna ki kaunse interfaces ping aur administrator login ka jawab denge, default route jodna, pehla traffic permit karna, aur "GUI nahi khulta" wale classic ticket ko troubleshoot karna. Yeh FortiOS Administrator exam ke deployment aur system configuration objectives hain, aur woh aadatein jo aap har FortiGate par use karoge.</p>
<p><b>Prerequisites.</b> Pehle free module <b>nse4-start</b> khatam karo (sessions, policies, NAT saral shabdon mein). CCNA se subnetting, default gateway ka idea aur static route chahiye. Fortinet ka experience zaroori nahi.</p>
<h3>Analogy: nayi dukaan kholna</h3>
<p>Nayi dukaan ko chabiyan, street number, signboard aur ek rule milta hai ki back office mein kaun ja sakta hai. Naya FortiGate bhi waisa hi hai. <b>Hostname</b> signboard hai. <b>Interface addresses</b> har darwaze ka street number hain. <b>Default route</b> shehar ki taraf jaane wali sadak hai. <b>allowaccess</b> tay karta hai ki staff entrance (admin services) kaunse darwaze par hai. In basics ke baad hi ghar ke rules, yaani firewall policies, likhte hain.</p>
<h3>Paanch-step bring-up</h3>
<ol>
<li><b>Naam do.</b> <code>config system global</code>, <code>set hostname</code>.</li>
<li><b>Address do.</b> LAN aur WAN interfaces par IP, alias aur role.</li>
<li><b>Management secure karo.</b> Sahi interfaces par sirf sahi services.</li>
<li><b>Route do.</b> ISP ke through default route.</li>
<li><b>Permit aur verify.</b> Pehli policy, phir ping, routing table aur session list se test.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Is module ka lab topology"><rect x="5" y="70" width="100" height="55" rx="9" fill="#e2e8f0"/><text x="55" y="94.5" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="55" y="111.5" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.10</text><line x1="105" y1="97" x2="150" y2="97" stroke="#64748b" stroke-width="2"/><text x="127" y="90" text-anchor="middle" class="svg-accent" font-size="11">port2</text><rect x="150" y="50" width="150" height="95" rx="9" fill="#fde68a"/><text x="225" y="94.5" text-anchor="middle" class="svg-ink" font-size="13">FGT1</text><text x="225" y="111.5" text-anchor="middle" class="svg-muted" font-size="11">NK-PUNE-FGT</text><line x1="300" y1="97" x2="350" y2="97" stroke="#64748b" stroke-width="2"/><text x="325" y="90" text-anchor="middle" class="svg-accent" font-size="11">port1</text><rect x="350" y="70" width="110" height="55" rx="9" fill="#ddd6fe"/><text x="405" y="94.5" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="405" y="111.5" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.1</text><line x1="460" y1="97" x2="505" y2="97" stroke="#64748b" stroke-width="2"/><rect x="505" y="70" width="130" height="55" rx="9" fill="#bbf7d0"/><text x="570" y="94.5" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV</text><text x="570" y="111.5" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8</text><text x="225" y="170" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.0.1.0/24 port2 par, WAN 203.0.113.0/30 port1 par</text></svg><p class="cap">Is module ka lab topology</p></div>
<h3>Lab devices aur addressing</h3>
<table class="cmp"><tr><th>Device</th><th>Interface</th><th>Address</th></tr>
<tr><td>FGT1 (NK-PUNE-FGT)</td><td>port2 (LAN)</td><td>10.0.1.1/24</td></tr>
<tr><td>FGT1</td><td>port1 (WAN)</td><td>203.0.113.2/30</td></tr>
<tr><td>ISP</td><td>GigabitEthernet0/0</td><td>203.0.113.1/30</td></tr>
<tr><td>INET-SRV</td><td>eth0</td><td>8.8.8.8/24, gateway 8.8.8.1</td></tr>
<tr><td>PC1</td><td>eth0</td><td>10.0.1.10/24, gateway 10.0.1.1</td></tr></table>
<p>Module mein do labs hain: <b>Factory default to first packet</b> (khali firewall par upar ka sab banao) aur <b>Ticket: the GUI will not open</b> (troubleshooting ticket NK-7713). Chapters 2 se 7 pehle lab ke liye zaroori cheezein sikhate hain; chapter 8 ticket ko walk karta hai.</p>
<div class="eg"><p><b>Worked example.</b> Brief kehta hai "LAN par ping, HTTPS aur SSH allow karo aur WAN par sirf ping". Yeh ek vaakya chaar settings ban jaata hai: port2 role lan, allowaccess ping h&#116;tps ssh, aur port1 role wan, allowaccess ping. Intent ke vaakya ko exact settings mein badalna wahi skill hai jo yeh module train karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Basics se pehle firewall policy se shuru karna. Sahi interface addresses aur route ke bina koi policy madad nahi kar sakti, aur aap galat layer ka peecha karoge.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam expect karta hai ki aap jaano ki <code>config system global</code> (hostname, admin ports, timeouts), <code>config system interface</code> (addresses, allowaccess) aur <code>config router static</code> (routes) mein kya configure hota hai.</p></div>
<div class="scn"><h4>Branch jo 40 minute mein live hua</h4><p>Ek naye branch ko dopahar tak internet chahiye tha. Engineer ne paanch-step order use kiya: hostname, interfaces, management access, default route, pehli policy. Har step ke baad usne ek cheez test ki (LAN gateway ping, ISP ping, firewall se 8.8.8.8 ping, phir PC se). Jab koi step fail hua to use pata tha kaunsi layer ko doshi thehrana hai, aur branch ek ghanta pehle live ho gaya.</p><p><b>Lesson:</b> fixed order aur har step ke baad test se faults jaldi milte hain.</p></div>
<div class="iv"><p class="q">"Bilkul naye FortiGate par sabse pehle kya configure karoge?"</p><p>Hostname, phir LAN interface address aur administrative access taaki manage kar sakoon, phir WAN interface, phir default route, phir NAT ke saath pehli policy. Har step ke baad test karta hoon. Default admin credentials bhi badalta hoon aur restrict karta hoon ki device ko kaun administer kar sake.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bring-up order: naam, address, secure management, route, permit aur verify.</li>
<li>Settings teen jagah rehti hain: system global, system interface, router static.</li>
<li>Module mein do labs hain: first packet aur GUI ticket.</li>
<li>Faults jaldi pakadne ke liye har step ke baad test karo.</li>
</ul></div>
`}};export{e as default};