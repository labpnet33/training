var e={id:`overview`,h:{en:`PAN-OS basics: what you will learn, the labs and the big picture`,hi:`PAN-OS basics: kya seekhoge, labs aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will drive the PAN-OS command line like a working engineer: move between operational and configure mode, build changes in the candidate configuration, commit them and read the validation errors when a commit is refused. Then you will bring up a firewall from factory default: Layer 3 interfaces with IP addresses, interface management profiles, security zones, the virtual router and a default route, and prove that the data plane really reaches the internet. These are the foundations of the configuration and deployment domain of the Palo Alto Networks NGFW Engineer exam (check the current exam guide for exact weights).</p>
<p><b>Prerequisites.</b> CCNA-level networking (IP subnets, static routes, ping) and the pan-start module: next-generation firewall ideas, zones, and the candidate and commit model. If "zone" or "commit" sound new, read pan-start first.</p>

<h3>Analogy: setting up a new branch office</h3>
<p>You arrive at a new branch with a locked, empty room. You must connect the cables (interfaces), give each line an address (IP), decide which side is "inside" and "outside" (zones), install the post office that knows where to send mail (virtual router and routes), and decide who may knock on the firewall's own door (management profiles). Only when you hand the paperwork to head office (commit) does the branch start working. This module is that setup, in the right order.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab topology">
<rect x="10" y="70" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="50" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="50" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="170" y="55" width="160" height="80" rx="10" fill="#ddd6fe"/><text x="250" y="85" text-anchor="middle" class="svg-ink" font-size="14">PA1 (PA-VM)</text><text x="250" y="107" text-anchor="middle" class="svg-muted" font-size="12">NK-PUNE-PA</text>
<rect x="410" y="70" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="450" y="92" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="450" y="110" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="550" y="70" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="590" y="92" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV</text><text x="590" y="110" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="90" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><text x="130" y="85" text-anchor="middle" class="svg-accent" font-size="12">e1/2</text>
<line x1="330" y1="95" x2="410" y2="95" stroke="#64748b" stroke-width="2"/><text x="370" y="85" text-anchor="middle" class="svg-accent" font-size="12">e1/1</text>
<line x1="490" y1="95" x2="550" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="250" y="170" text-anchor="middle" class="svg-muted" font-size="12">trust: e1/2 10.0.1.1/24     untrust: e1/1 203.0.113.2/30</text>
</svg><p class="cap">The lab topology: LAN side on ethernet1/2, ISP side on ethernet1/1.</p></div>

<h3>The two labs in this module</h3>
<ul>
<li><b>Lab: From factory default to first commit</b> (configuration). A new PA-VM sits between the Pune LAN (ethernet1/2) and the ISP (ethernet1/1) with only factory settings. You name it NK-PUNE-PA, create two management profiles (allow-ping and mgmt-lan), configure both interfaces, put them in the default virtual router and in the zones trust and untrust, add the default route to 203.0.113.1, commit, and prove the data plane reaches 8.8.8.8 with a ping sourced from 203.0.113.2. A last question asks which forwarding entry ethernet1/2 shows.</li>
<li><b>Lab: Ticket, the DMZ is dead after the change</b> (troubleshooting). Change CHG-2291 added a DMZ web server 10.0.2.10 on ethernet1/3. The IP is committed, yet the server cannot ping its gateway 10.0.2.1. You find everything missing and fix it with one commit.</li>
</ul>
<p>These chapters teach everything the two labs need, with the same device names and addressing. Every command output shown was captured from the NK-OS simulator, which imitates PAN-OS 11.1 behaviour. It is an educational simulator and not Palo Alto software, so a few real-product commands (for example saving or loading configuration snapshots) are not available there, and the chapters say so where it matters.</p>

<h3>Chapter map</h3>
<ol>
<li>This overview.</li>
<li>CLI modes and moving around the configuration.</li>
<li>Candidate, running and commit in practice.</li>
<li>Management interface and interface management profiles.</li>
<li>Layer 3 interfaces, the virtual router and zones.</li>
<li>Static routes and testing the data plane.</li>
<li>Policy and NAT just enough to pass traffic.</li>
<li>Troubleshooting workflow and the DMZ ticket.</li>
<li>Summary, cheat-sheet and exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Day one at the branch. The firewall boots with hostname PA1 and no interfaces configured. After the lab, you can run <code>show interface all</code> and see both interfaces with a zone and <code>vr:default</code> and you can ping the internet from the data plane. Everything in between is what you learn here.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Typing the whole configuration in one go and committing once at the end. If the commit fails you will have to hunt through many lines. In these labs commit after each logical block (interfaces, then zones, then route) so each error is small.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam questions ask which of several missing items explains a symptom. Always connect the symptom to the layer: no ARP means interface or IP, timeout to the firewall itself means management profile, no internet through the firewall means route, policy or NAT.</p></div>

<div class="scn"><h4>Day-one build that took four hours</h4><p>A new engineer typed 60 lines, committed, and got six validation errors. He fixed three, committed again and found the data plane still dead because he had forgotten the zone assignment and the route. A colleague rebuilt it in 15 minutes: IP and profile, commit, verify; zone and virtual router, commit, verify; route, commit, ping. Each step proved the previous one.</p><p><b>Lesson:</b> build in small committed steps and verify each.</p></div>

<div class="iv"><p class="q">"How do you bring up a new Palo Alto firewall from factory default?"</p><p>Set the hostname and management access, configure the data interfaces with IPs, create interface management profiles for ping and management, put the interfaces in the virtual router and zones, add a default route, add the security and NAT rules, commit, then verify with show interface all, show routing route and a ping with source. Say you commit in stages and verify at each stage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module builds a working Layer 3 firewall from factory default.</li>
<li>Two labs: first commit (build) and the dead DMZ (troubleshoot).</li>
<li>Order: hostname, profiles, interface IPs, virtual router, zones, route, then verify.</li>
<li>Commit in small steps and verify after each one.</li>
<li>The simulator imitates PAN-OS 11.1 but is not Palo Alto software.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap PAN-OS command line ko working engineer ki tarah chalaoge: operational aur configure mode ke beech jaana, candidate configuration mein changes banana, commit karna aur commit refuse hone par validation errors padhna. Phir aap factory default se firewall up karoge: IP addresses ke saath Layer 3 interfaces, interface management profiles, security zones, virtual router aur default route, aur saabit karoge ki data plane sach mein internet tak pahunchta hai. Yeh Palo Alto Networks NGFW Engineer exam ke configuration aur deployment domain ki buniyaad hai (exact weights ke liye current exam guide dekho).</p>
<p><b>Prerequisites.</b> CCNA-level networking (IP subnets, static routes, ping) aur pan-start module: next-generation firewall ke ideas, zones, aur candidate tatha commit model. Agar "zone" ya "commit" naye lagte hain to pehle pan-start padho.</p>

<h3>Analogy: naya branch office set karna</h3>
<p>Aap naye branch par pahunchte ho jahan ek locked, khali kamra hai. Aapko cables jodne hain (interfaces), har line ko address dena hai (IP), tay karna hai ki kaunsa side "inside" aur "outside" hai (zones), woh post office lagana hai jo jaanta hai mail kahan bhejni hai (virtual router aur routes), aur tay karna hai ki firewall ke apne darwaze par kaun dastak de sakta hai (management profiles). Jab aap kaagzaat head office ko dete ho (commit) tabhi branch kaam shuru karta hai. Yeh module wahi setup hai, sahi order mein.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab topology">
<rect x="10" y="70" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="50" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="50" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="170" y="55" width="160" height="80" rx="10" fill="#ddd6fe"/><text x="250" y="85" text-anchor="middle" class="svg-ink" font-size="14">PA1 (PA-VM)</text><text x="250" y="107" text-anchor="middle" class="svg-muted" font-size="12">NK-PUNE-PA</text>
<rect x="410" y="70" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="450" y="92" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="450" y="110" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="550" y="70" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="590" y="92" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV</text><text x="590" y="110" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="90" y1="95" x2="170" y2="95" stroke="#64748b" stroke-width="2"/><text x="130" y="85" text-anchor="middle" class="svg-accent" font-size="12">e1/2</text>
<line x1="330" y1="95" x2="410" y2="95" stroke="#64748b" stroke-width="2"/><text x="370" y="85" text-anchor="middle" class="svg-accent" font-size="12">e1/1</text>
<line x1="490" y1="95" x2="550" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="250" y="170" text-anchor="middle" class="svg-muted" font-size="12">trust: e1/2 10.0.1.1/24     untrust: e1/1 203.0.113.2/30</text>
</svg><p class="cap">Lab topology: LAN side ethernet1/2 par, ISP side ethernet1/1 par.</p></div>

<h3>Is module ke do labs</h3>
<ul>
<li><b>Lab: From factory default to first commit</b> (configuration). Naya PA-VM Pune LAN (ethernet1/2) aur ISP (ethernet1/1) ke beech hai, sirf factory settings ke saath. Aap use NK-PUNE-PA naam doge, do management profiles (allow-ping aur mgmt-lan) banaoge, dono interfaces configure karoge, unhe default virtual router aur trust tatha untrust zones mein daaloge, 203.0.113.1 ki taraf default route jodoge, commit karoge, aur 203.0.113.2 se sourced ping se saabit karoge ki data plane 8.8.8.8 tak pahunchta hai. Aakhri sawal poochta hai ki ethernet1/2 kaunsi forwarding entry dikhata hai.</li>
<li><b>Lab: Ticket, change ke baad DMZ band hai</b> (troubleshooting). Change CHG-2291 ne ethernet1/3 par DMZ web server 10.0.2.10 jodi. IP committed hai, phir bhi server apne gateway 10.0.2.1 ko ping nahi kar pa raha. Aap jo kuch missing hai sab dhoondhte ho aur ek commit mein fix karte ho.</li>
</ul>
<p>Yeh chapters wahi sab sikhate hain jo dono labs ko chahiye, wahi device names aur addressing ke saath. Dikhaya gaya har command output NK-OS simulator se capture kiya gaya hai, jo PAN-OS 11.1 behaviour imitate karta hai. Yeh educational simulator hai aur Palo Alto software nahi, isliye kuch real-product commands (jaise configuration snapshots save ya load karna) wahan available nahi, aur chapters jahan matter karta hai wahan yeh batate hain.</p>

<h3>Chapter map</h3>
<ol>
<li>Yeh overview.</li>
<li>CLI modes aur configuration mein ghoomna.</li>
<li>Practice mein candidate, running aur commit.</li>
<li>Management interface aur interface management profiles.</li>
<li>Layer 3 interfaces, virtual router aur zones.</li>
<li>Static routes aur data plane test karna.</li>
<li>Traffic pass karne layak policy aur NAT.</li>
<li>Troubleshooting workflow aur DMZ ticket.</li>
<li>Summary, cheat-sheet aur exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Branch par pehla din. Firewall hostname PA1 ke saath boot hota hai aur koi interface configured nahi. Lab ke baad aap <code>show interface all</code> chalakar dono interfaces ko zone aur <code>vr:default</code> ke saath dekhte ho aur data plane se internet ping kar sakte ho. Beech ka sab kuch yahan seekhoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Poori configuration ek saath type karke aakhir mein ek hi baar commit karna. Commit fail ho to kai lines mein dhoondhna padta hai. In labs mein har logical block (interfaces, phir zones, phir route) ke baad commit karo taaki har error chhota ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam sawaal poochte hain ki kai missing cheezon mein se kaunsi symptom samjhati hai. Symptom ko hamesha layer se jodo: ARP nahi matlab interface ya IP, firewall ke khud tak timeout matlab management profile, firewall ke through internet nahi matlab route, policy ya NAT.</p></div>

<div class="scn"><h4>Day-one build jisme chaar ghante lage</h4><p>Ek naye engineer ne 60 lines type ki, commit kiya, aur chhe validation errors mile. Usne teen theek kiye, dobara commit kiya aur dekha ki data plane ab bhi dead hai kyunki zone assignment aur route bhool gaya tha. Ek colleague ne 15 minute mein rebuild kiya: IP aur profile, commit, verify; zone aur virtual router, commit, verify; route, commit, ping. Har step ne pichle ko saabit kiya.</p><p><b>Lesson:</b> chhote committed steps mein build karo aur har ek verify karo.</p></div>

<div class="iv"><p class="q">"Factory default se naya Palo Alto firewall kaise up karte ho?"</p><p>Hostname aur management access set karo, data interfaces par IPs configure karo, ping aur management ke liye interface management profiles banao, interfaces ko virtual router aur zones mein daalo, default route jodo, security aur NAT rules jodo, commit karo, phir show interface all, show routing route aur source ke saath ping se verify karo. Batao ki aap stages mein commit karte ho aur har stage par verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module factory default se working Layer 3 firewall banata hai.</li>
<li>Do labs: first commit (build) aur dead DMZ (troubleshoot).</li>
<li>Order: hostname, profiles, interface IPs, virtual router, zones, route, phir verify.</li>
<li>Chhote steps mein commit karo aur har ek ke baad verify karo.</li>
<li>Simulator PAN-OS 11.1 imitate karta hai lekin Palo Alto software nahi hai.</li>
</ul></div>
`}};export{e as default};