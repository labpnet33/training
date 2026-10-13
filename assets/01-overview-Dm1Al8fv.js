var e={id:`overview`,h:{en:`SSL VPN remote access: what you will learn and the big picture`,hi:`SSL VPN remote access: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a FortiGate gives <b>remote users</b> secure access to company resources: the difference between tunnel mode and web mode, how portals, users and groups control who gets what, how split tunnelling decides which traffic goes through the VPN, how to harden the service with MFA and certificates, how to troubleshoot a user who cannot connect, and how newer FortiOS releases move remote access towards <b>IPsec dial-up</b>. It covers the remote access VPN objectives of the Fortinet NSE 4 / FortiOS Administrator 7.6 exam.</p>
<p><b>Prerequisites.</b> You should know FortiGate basics from <b>nse4-setup</b>, address objects and policies from <b>nse4-policy</b>, and the idea of site-to-site IPsec from <b>nse4-ipsec</b>. If you have built remote access on another platform, <b>sec-asa-vpn</b> and <b>sec-ftd-vpn</b> are good comparisons.</p>
<div class="note"><p><b>Honest note about practice.</b> The simulator does not yet have a FortiGate remote-access lab. The configuration in this module is labelled <b>Reference configuration (not run in the simulator)</b>, and I print no command output that I have not captured. Practise the surrounding skills in nse4-setup, nse4-policy and nse4-routing.</p></div>

<h3>Analogy: the visitor pass at a company gate</h3>
<p>Staff who work from home need to get into the office network, but the office does not open its doors to everyone. At the gate a guard checks who you are (a username and password, plus a second factor), checks your visitor badge type (which areas you may enter), and gives you a temporary pass number. Anything you do inside carries that pass. A remote access VPN works the same way: the FortiGate is the gate, the portal is the badge type, the tunnel address from a pool is the pass number, and firewall policies are the doors you are allowed to open.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Remote access VPN">
<rect x="20" y="60" width="120" height="70" rx="10" fill="#bae6fd"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">Remote user</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">laptop at home</text>
<rect x="260" y="60" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="325" y="90" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="325" y="110" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<rect x="510" y="60" width="110" height="70" rx="10" fill="#fde68a"/><text x="565" y="90" text-anchor="middle" class="svg-ink" font-size="13">Company LAN</text><text x="565" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24</text>
<line x1="140" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="200" y="85" text-anchor="middle" class="svg-accent" font-size="12">encrypted</text><text x="450" y="85" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Tunnel IP 10.99.0.20 from a pool, user checked by group and MFA</text>
</svg><p class="cap">One user, one tunnel address, access limited by policy.</p></div>

<h3>Remote access versus site-to-site</h3>
<ul>
<li><b>Site-to-site</b> (nse4-ipsec) joins two networks and both ends are firewalls with fixed identities.</li>
<li><b>Remote access</b> joins one person's device to a network. The client address and location change, so the firewall assigns a tunnel address and authenticates the <b>user</b>, not just the device.</li>
</ul>

<h3>SSL VPN in one page</h3>
<p><b>SSL VPN</b> uses TLS, the same protocol that protects secure websites, so it usually works from networks that allow HTTPS, even behind hotel or home routers. A user connects in one of two ways:</p>
<ul>
<li><b>Tunnel mode.</b> The FortiClient app creates a virtual network adapter and carries any IP traffic through the tunnel.</li>
<li><b>Web mode.</b> The user signs in with a browser and uses a portal page with bookmarks to web, file, RDP or SSH resources through the FortiGate. No client app is required.</li>
</ul>
<p>The next chapters cover portals, authentication, policies and split tunnelling in detail.</p>

<div class="warn"><p><b>Important version note.</b> Fortinet has been retiring SSL VPN in newer FortiOS releases. In FortiOS 7.6, tunnel-mode SSL VPN was removed from some smaller models and, in later 7.6 builds, from all models; Fortinet directs customers to <b>IPsec dial-up VPN</b> with FortiClient, and offers browser-based access through agentless and ZTNA features. Always read the release notes for the exact firmware you run. This module teaches SSL VPN because it is still deployed widely and tested for its concepts, and teaches the IPsec dial-up replacement in chapter 7.</p></div>

<div class="eg"><p><b>Worked example.</b> A trainer working from home opens FortiClient and connects to vpn.company.example. The FortiGate asks for a username, password and a six-digit token. The user belongs to the group <code>SSLVPN-Users</code>, so the portal assigned is <code>tunnel-access</code>. The user receives the tunnel address 10.99.0.20 from the pool, and a policy allows that address to reach the file server at 10.10.0.20 only.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication proves who the user is; the portal and policy decide what the user can reach. A question about a user who connects but cannot reach a server is almost always about policy, routing or split tunnelling, not about login.</p></div>

<div class="scn"><h4>Work from home with a flat network and no MFA</h4><p>A company let staff reach the whole office LAN with just a password. A phished password gave an outsider the same access as the employee. The team added MFA, restricted each group to the servers it needed, and logged every connection. The next phishing attempt produced a failed MFA prompt and an alert, not a breach.</p><p><b>Lesson:</b> remote access is an entry point; authenticate strongly and limit what each user can reach.</p></div>

<div class="iv"><p class="q">"What is the difference between SSL VPN tunnel mode and web mode?"</p><p>Tunnel mode uses the FortiClient app to create a virtual adapter and carries any IP traffic, so it behaves like being on the LAN. Web mode needs only a browser and presents bookmarks to specific applications through a portal. I would also mention that newer FortiOS releases are removing SSL VPN and recommending IPsec dial-up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote access authenticates users and gives them tunnel addresses from a pool.</li>
<li>SSL VPN offers tunnel mode (FortiClient) and web mode (browser portal).</li>
<li>Portals and policies control what a user can reach.</li>
<li>Use MFA and least-privilege access.</li>
<li>Check the release notes: newer FortiOS moves to IPsec dial-up.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki FortiGate <b>remote users</b> ko company resources tak secure access kaise deta hai: tunnel mode aur web mode mein difference, portals, users aur groups kaise tay karte hain ki kisko kya milega, split tunnelling kaise decide karti hai ki kaun sa traffic VPN se jaayega, MFA aur certificates se service ko harden kaise karein, connect na ho paane wale user ko troubleshoot kaise karein, aur naye FortiOS releases remote access ko <b>IPsec dial-up</b> ki taraf kaise le ja rahe hain. Yeh Fortinet NSE 4 / FortiOS Administrator 7.6 exam ke remote access VPN objectives cover karta hai.</p>
<p><b>Prerequisites.</b> Aapko <b>nse4-setup</b> ke FortiGate basics, <b>nse4-policy</b> ke address objects aur policies, aur <b>nse4-ipsec</b> ka site-to-site IPsec ka idea aana chahiye. Kisi aur platform par remote access banaya hai to <b>sec-asa-vpn</b> aur <b>sec-ftd-vpn</b> achhe comparisons hain.</p>
<div class="note"><p><b>Practice ke baare mein seedhi baat.</b> Simulator mein abhi FortiGate remote-access lab nahi hai. Is module ki configuration ko <b>Reference configuration (not run in the simulator)</b> likha gaya hai, aur jo command output maine capture nahi kiya woh print nahi karta. Aas-paas ke skills nse4-setup, nse4-policy aur nse4-routing mein practise karo.</p></div>

<h3>Analogy: company gate ka visitor pass</h3>
<p>Ghar se kaam karne wale staff ko office network mein jaana hota hai, lekin office apne darwaze sab ke liye nahi kholta. Gate par guard check karta hai ki aap kaun ho (username aur password, saath mein second factor), aapka visitor badge type kya hai (kin areas mein ja sakte ho), aur aapko temporary pass number deta hai. Andar aap jo bhi karte ho woh is pass ke saath hota hai. Remote access VPN bilkul aise hi kaam karta hai: FortiGate gate hai, portal badge type hai, pool se tunnel address pass number hai, aur firewall policies woh darwaze hain jo aap khol sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Remote access VPN">
<rect x="20" y="60" width="120" height="70" rx="10" fill="#bae6fd"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">Remote user</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">ghar par laptop</text>
<rect x="260" y="60" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="325" y="90" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="325" y="110" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<rect x="510" y="60" width="110" height="70" rx="10" fill="#fde68a"/><text x="565" y="90" text-anchor="middle" class="svg-ink" font-size="13">Company LAN</text><text x="565" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24</text>
<line x1="140" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="200" y="85" text-anchor="middle" class="svg-accent" font-size="12">encrypted</text><text x="450" y="85" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Pool se tunnel IP 10.99.0.20, user group aur MFA se check hota hai</text>
</svg><p class="cap">Ek user, ek tunnel address, policy se access seemit.</p></div>

<h3>Remote access aur site-to-site</h3>
<ul>
<li><b>Site-to-site</b> (nse4-ipsec) do networks ko jodta hai aur dono ends fixed identities wale firewalls hote hain.</li>
<li><b>Remote access</b> ek insaan ke device ko network se jodta hai. Client ka address aur location badalte rehte hain, isliye firewall tunnel address assign karta hai aur sirf device nahi balki <b>user</b> ko authenticate karta hai.</li>
</ul>

<h3>SSL VPN ek page mein</h3>
<p><b>SSL VPN</b> TLS use karta hai, wahi protocol jo secure websites ko protect karta hai, isliye yeh aam taur par un networks se bhi chalta hai jo HTTPS allow karte hain, hotel ya ghar ke routers ke peeche bhi. User do tareeke se connect karta hai:</p>
<ul>
<li><b>Tunnel mode.</b> FortiClient app virtual network adapter banati hai aur koi bhi IP traffic tunnel se le jaati hai.</li>
<li><b>Web mode.</b> User browser se sign in karta hai aur portal page ke bookmarks se web, file, RDP ya SSH resources FortiGate ke through use karta hai. Client app ki zaroorat nahi.</li>
</ul>
<p>Agle chapters portals, authentication, policies aur split tunnelling detail mein cover karte hain.</p>

<div class="warn"><p><b>Zaroori version note.</b> Fortinet naye FortiOS releases mein SSL VPN ko retire kar raha hai. FortiOS 7.6 mein tunnel-mode SSL VPN kuch chhote models se, aur baad ke 7.6 builds mein saare models se hata diya gaya; Fortinet customers ko FortiClient ke saath <b>IPsec dial-up VPN</b> ki taraf bhejta hai, aur browser-based access agentless aur ZTNA features se deta hai. Jo firmware aap chalate ho uske release notes hamesha padho. Yeh module SSL VPN isliye sikhata hai kyunki woh abhi bhi bahut deploy hai aur uske concepts test hote hain, aur chapter 7 mein IPsec dial-up replacement sikhata hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek trainer ghar se kaam karte hue FortiClient kholta hai aur vpn.company.example se connect karta hai. FortiGate username, password aur chhe-digit token maangta hai. User group <code>SSLVPN-Users</code> mein hai, isliye portal <code>tunnel-access</code> assign hota hai. User ko pool se tunnel address 10.99.0.20 milta hai, aur ek policy us address ko sirf 10.10.0.20 file server tak jaane deti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication prove karta hai ki user kaun hai; portal aur policy tay karte hain ki user kya reach kar sakta hai. Jo user connect ho jaata hai lekin server tak nahi pahunch paata uske baare mein question lagbhag hamesha policy, routing ya split tunnelling ke baare mein hota hai, login ke baare mein nahi.</p></div>

<div class="scn"><h4>Flat network aur bina MFA ke work from home</h4><p>Ek company staff ko sirf password se poore office LAN tak jaane deti thi. Phished password ne outsider ko employee jaisa hi access de diya. Team ne MFA add kiya, har group ko sirf unhi servers tak seemit kiya jinki use zaroorat thi, aur har connection log kiya. Agli phishing attempt ne breach nahi, failed MFA prompt aur alert diya.</p><p><b>Lesson:</b> remote access entry point hai; strongly authenticate karo aur seemit karo ki har user kya reach kar sakta hai.</p></div>

<div class="iv"><p class="q">"SSL VPN tunnel mode aur web mode mein kya difference hai?"</p><p>Tunnel mode FortiClient app se virtual adapter banata hai aur koi bhi IP traffic le jaata hai, isliye LAN par hone jaisa behave karta hai. Web mode ko sirf browser chahiye aur woh portal ke zariye specific applications ke bookmarks deta hai. Main yeh bhi bataunga ki naye FortiOS releases SSL VPN hata rahe hain aur IPsec dial-up recommend kar rahe hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote access users ko authenticate karta hai aur pool se tunnel addresses deta hai.</li>
<li>SSL VPN tunnel mode (FortiClient) aur web mode (browser portal) deta hai.</li>
<li>Portals aur policies tay karte hain ki user kya reach karega.</li>
<li>MFA aur least-privilege access use karo.</li>
<li>Release notes check karo: naya FortiOS IPsec dial-up ki taraf ja raha hai.</li>
</ul></div>
`}};export{e as default};