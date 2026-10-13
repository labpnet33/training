var e={id:`splash-and-guest-access`,h:{en:`Splash pages and safe guest access`,hi:`Splash pages aur safe guest access`},body:{en:`
<h3>Why guests need their own design</h3>
<p>A shop, an office lobby or a showroom wants visitors to get internet, but visitors must never touch staff laptops or servers. A good guest design has four layers: a separate <b>SSID</b>, a separate <b>VLAN</b> (30), a <b>splash page</b> that sets the rules, and <b>firewall rules</b> that keep guests away from the internal networks. If one layer is missing the design is weak.</p>

<h3>The splash page</h3>
<p>A <b>splash page</b> (captive portal) is a web page shown to a new guest before the internet works. The simplest type is <b>click-through</b>: the guest sees a message such as "Welcome to Bharat Retail Co. Free Wi-Fi for customers" with a button, accepts the terms and is let through. Other types ask for a login or a voucher, but this track teaches click-through.</p>
<p>How it works: the guest joins the open SSID and gets a DHCP address in VLAN 30. Until the page is accepted, the AP lets only the splash traffic through and blocks the rest. In the dashboard the client is shown as <b>splash pending</b>. After the click the client is marked authorised and traffic flows. Splash is about <b>acceptance and access</b>, not strong security: the radio link on an open SSID is not protected by a password.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Guest flow through splash and firewall">
<rect x="10" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="13">Guest phone</text>
<rect x="160" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="215" y="52" text-anchor="middle" class="svg-ink" font-size="13">AP, Guest SSID</text><text x="215" y="68" text-anchor="middle" class="svg-muted" font-size="12">VLAN 30</text>
<rect x="310" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="365" y="52" text-anchor="middle" class="svg-ink" font-size="13">Splash page</text><text x="365" y="68" text-anchor="middle" class="svg-muted" font-size="12">click to accept</text>
<rect x="460" y="30" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="540" y="52" text-anchor="middle" class="svg-ink" font-size="13">MX firewall</text><text x="540" y="68" text-anchor="middle" class="svg-muted" font-size="12">deny 10, 20</text>
<line x1="120" y1="55" x2="160" y2="55" stroke="#64748b" stroke-width="2"/><line x1="270" y1="55" x2="310" y2="55" stroke="#64748b" stroke-width="2"/><line x1="420" y1="55" x2="460" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="130" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="395" y="155" text-anchor="middle" class="svg-ink" font-size="13">Internet: allowed</text>
<rect x="490" y="130" width="130" height="40" rx="8" fill="#fecaca"/><text x="555" y="155" text-anchor="middle" class="svg-ink" font-size="13">VLAN 10, 20: denied</text>
<line x1="540" y1="80" x2="395" y2="130" stroke="#64748b" stroke-width="2"/><line x1="540" y1="80" x2="555" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="190" width="610" height="40" rx="6" fill="#e2e8f0"/><text x="315" y="215" text-anchor="middle" class="svg-ink" font-size="13">Before the click: splash pending. After the click: internet only.</text>
</svg><p class="cap">The guest is held at the splash page, then released to the internet but kept away from staff and servers.</p></div>

<h3>Client isolation</h3>
<p><b>Client isolation</b> stops wireless clients on the same SSID from talking to each other. Without it, one guest phone could scan or attack another guest phone through the AP. With it on, each guest can still reach the gateway and the internet but not the neighbour. It is set on the SSID and is different from the firewall rule that keeps guests off the internal VLANs.</p>

<h3>Firewall rules that keep guests out</h3>
<p>On the MX Firewall page the guest policy is two rules at the top, because first match wins:</p>
<pre class="out">Firewall  L3 rules  (network: Mumbai HQ)
#  Policy  Protocol  Source        Destination     Hits
1  Deny    any       10.1.30.0/24  10.1.10.0/24    <span class="hl">12</span>
2  Deny    any       10.1.30.0/24  10.1.20.0/24    31
3  Allow   any       10.1.10.0/24  10.1.20.0/24    540
D  Allow   any       any           any             9,870  (default)</pre>
<p>Guests (10.1.30.0/24) cannot reach Staff (VLAN 10) or Servers (VLAN 20). Everything else, such as internet, hits the default allow. Remember: the rules are policy on the MX, so they are the same for wired and wireless guests.</p>

<div class="eg"><p><b>Worked example.</b> A visitor at Bengaluru joins BharatRetail-Guest and gets 10.2.30.114. The browser opens the splash page; the visitor clicks Accept and the client moves from splash pending to authorised. The visitor opens news.example and it works. A curious visitor tries 10.2.20.10 (the server): rule 2 denies it and the hit counter rises.</p></div>

<h3>Checking the result</h3>
<pre class="out">Clients  (network: Bengaluru Branch)
Client       SSID                 VLAN  IP            State
phone-g1     BharatRetail-Guest   30    10.2.30.114   <span class="hl">splash pending</span>
phone-g2     BharatRetail-Guest   30    10.2.30.115   authorised
laptop-s1    BharatRetail-Staff   10    10.2.10.120   online</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Enabling splash makes the AP hold unaccepted clients and allow only the splash flow. Enabling client isolation makes the AP drop client-to-client frames on that SSID. Firewall rules change inter-VLAN decisions on the MX. All take effect after Save changes; they affect new sessions.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Putting the guest SSID in the staff VLAN; forgetting the guest deny rules; putting the Allow above the Deny; thinking splash equals encryption; turning client isolation off for convenience.</p></div>
<div class="exam"><p><b>Exam trap.</b> Client isolation (same SSID, client to client) and guest isolation (VLAN 30 to VLAN 10/20 by firewall) are different controls. A good design uses both.</p></div>

<div class="scn"><h4>Customer on the file server</h4><p>A showroom visitor reached the HQ file share from the guest Wi-Fi. The guest SSID was tagged VLAN 30, but someone had put "Allow any to 10.1.20.0/24" at the top of the firewall for a vendor visit. The engineer deleted it and added the two deny rules for guests; the splash still worked and internal access was blocked.</p><p><b>Lesson:</b> guest safety is the SSID, the VLAN and the firewall order working together.</p></div>

<div class="iv"><p class="q">"How would you build safe guest Wi-Fi?"</p><p>Strong answer: separate open or voucher SSID with splash, tagged to its own VLAN, DHCP from the MX, client isolation on, deny rules from the guest VLAN to staff and server VLANs placed above any allow, and optionally content filtering. Mention that a splash page is acceptance, not security.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest design = separate SSID + VLAN 30 + splash + firewall denies.</li>
<li>Click-through splash holds a client at "splash pending" until accepted.</li>
<li>Client isolation blocks guest-to-guest traffic on the SSID.</li>
<li>Deny rules for VLAN 10 and 20 must sit above any broad allow.</li>
<li>Splash is not encryption; open SSIDs are not protected on the air.</li>
</ul></div>
`,hi:`
<h3>Guests ko apna design kyun chahiye</h3>
<p>Dukaan, office lobby ya showroom chahta hai ki visitors ko internet mile, lekin visitors ko staff laptops ya servers ko kabhi nahi chhoona chahiye. Achhe guest design mein chaar layers hoti hain: alag <b>SSID</b>, alag <b>VLAN</b> (30), rules batane wala <b>splash page</b>, aur <b>firewall rules</b> jo guests ko internal networks se door rakhte hain. Agar ek bhi layer missing hai to design kamzor hai.</p>

<h3>Splash page</h3>
<p><b>Splash page</b> (captive portal) ek web page hai jo naye guest ko internet chalne se pehle dikhta hai. Sabse simple type <b>click-through</b> hai: guest ko "Welcome to Bharat Retail Co. Free Wi-Fi for customers" jaisa message aur ek button dikhta hai, woh terms accept karta hai aur use jaane diya jaata hai. Doosre types login ya voucher maangte hain, lekin yeh track click-through sikhata hai.</p>
<p>Kaise kaam karta hai: guest open SSID join karta hai aur VLAN 30 mein DHCP address paata hai. Jab tak page accept nahi hota, AP sirf splash traffic jaane deta hai aur baaki block karta hai. Dashboard mein client <b>splash pending</b> dikhta hai. Click ke baad client authorised mark hota hai aur traffic chalta hai. Splash <b>acceptance aur access</b> ke baare mein hai, strong security nahi: open SSID par radio link password se protected nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Splash aur firewall ke through guest flow">
<rect x="10" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="13">Guest phone</text>
<rect x="160" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="215" y="52" text-anchor="middle" class="svg-ink" font-size="13">AP, Guest SSID</text><text x="215" y="68" text-anchor="middle" class="svg-muted" font-size="12">VLAN 30</text>
<rect x="310" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="365" y="52" text-anchor="middle" class="svg-ink" font-size="13">Splash page</text><text x="365" y="68" text-anchor="middle" class="svg-muted" font-size="12">accept ka click</text>
<rect x="460" y="30" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="540" y="52" text-anchor="middle" class="svg-ink" font-size="13">MX firewall</text><text x="540" y="68" text-anchor="middle" class="svg-muted" font-size="12">deny 10, 20</text>
<line x1="120" y1="55" x2="160" y2="55" stroke="#64748b" stroke-width="2"/><line x1="270" y1="55" x2="310" y2="55" stroke="#64748b" stroke-width="2"/><line x1="420" y1="55" x2="460" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="130" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="395" y="155" text-anchor="middle" class="svg-ink" font-size="13">Internet: allowed</text>
<rect x="490" y="130" width="130" height="40" rx="8" fill="#fecaca"/><text x="555" y="155" text-anchor="middle" class="svg-ink" font-size="13">VLAN 10, 20: denied</text>
<line x1="540" y1="80" x2="395" y2="130" stroke="#64748b" stroke-width="2"/><line x1="540" y1="80" x2="555" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="190" width="610" height="40" rx="6" fill="#e2e8f0"/><text x="315" y="215" text-anchor="middle" class="svg-ink" font-size="13">Click se pehle: splash pending. Click ke baad: sirf internet.</text>
</svg><p class="cap">Guest ko splash page par roka jaata hai, phir internet tak chhoda jaata hai lekin staff aur servers se door rakha jaata hai.</p></div>

<h3>Client isolation</h3>
<p><b>Client isolation</b> ek hi SSID par wireless clients ko ek dusre se baat karne se rokta hai. Iske bina ek guest phone AP ke through doosre guest phone ko scan ya attack kar sakta hai. On hone par har guest gateway aur internet tak pahunch sakta hai lekin padosi tak nahi. Yeh SSID par set hota hai aur us firewall rule se alag hai jo guests ko internal VLANs se door rakhta hai.</p>

<h3>Firewall rules jo guests ko bahar rakhte hain</h3>
<p>MX Firewall page par guest policy upar ke do rules hain, kyunki pehla match jeetta hai:</p>
<pre class="out">Firewall  L3 rules  (network: Mumbai HQ)
#  Policy  Protocol  Source        Destination     Hits
1  Deny    any       10.1.30.0/24  10.1.10.0/24    <span class="hl">12</span>
2  Deny    any       10.1.30.0/24  10.1.20.0/24    31
3  Allow   any       10.1.10.0/24  10.1.20.0/24    540
D  Allow   any       any           any             9,870  (default)</pre>
<p>Guests (10.1.30.0/24) Staff (VLAN 10) ya Servers (VLAN 20) tak nahi pahunch sakte. Baaki sab, jaise internet, default allow par jaata hai. Yaad rakho: rules MX par policy hain, isliye wired aur wireless guests ke liye same hain.</p>

<div class="eg"><p><b>Worked example.</b> Bengaluru mein ek visitor BharatRetail-Guest join karta hai aur 10.2.30.114 paata hai. Browser splash page kholta hai; visitor Accept click karta hai aur client splash pending se authorised ho jaata hai. Visitor news.example kholta hai aur chalta hai. Ek curious visitor 10.2.20.10 (server) try karta hai: rule 2 deny karta hai aur hit counter badhta hai.</p></div>

<h3>Result check karna</h3>
<pre class="out">Clients  (network: Bengaluru Branch)
Client       SSID                 VLAN  IP            State
phone-g1     BharatRetail-Guest   30    10.2.30.114   <span class="hl">splash pending</span>
phone-g2     BharatRetail-Guest   30    10.2.30.115   authorised
laptop-s1    BharatRetail-Staff   10    10.2.10.120   online</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Splash enable karne se AP unaccepted clients ko hold karta hai aur sirf splash flow allow karta hai. Client isolation enable karne se AP us SSID par client-to-client frames drop karta hai. Firewall rules MX par inter-VLAN decisions badalte hain. Sab Save changes ke baad lagte hain; naye sessions par asar karte hain.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Guest SSID ko staff VLAN mein rakhna; guest deny rules bhool jaana; Deny ke upar Allow rakhna; splash ko encryption samajhna; convenience ke liye client isolation off karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Client isolation (same SSID, client se client) aur guest isolation (VLAN 30 se VLAN 10/20 firewall se) alag controls hain. Achha design dono use karta hai.</p></div>

<div class="scn"><h4>File server par customer</h4><p>Showroom ka ek visitor guest Wi-Fi se HQ file share tak pahunch gaya. Guest SSID VLAN 30 par tagged tha, lekin vendor visit ke liye kisi ne firewall ke top par "Allow any to 10.1.20.0/24" daal diya tha. Engineer ne use delete kiya aur guests ke liye do deny rules add kiye; splash phir bhi chala aur internal access block ho gaya.</p><p><b>Seekh:</b> guest safety SSID, VLAN aur firewall order ka milkar kaam karna hai.</p></div>

<div class="iv"><p class="q">"Safe guest Wi-Fi kaise banaoge?"</p><p>Strong answer: alag open ya voucher SSID splash ke saath, apne VLAN par tagged, DHCP MX se, client isolation on, guest VLAN se staff aur server VLANs ke liye deny rules kisi bhi allow ke upar, aur optional content filtering. Batao ki splash page acceptance hai, security nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest design = alag SSID + VLAN 30 + splash + firewall denies.</li>
<li>Click-through splash client ko accept hone tak "splash pending" par rokta hai.</li>
<li>Client isolation SSID par guest-to-guest traffic block karta hai.</li>
<li>VLAN 10 aur 20 ke deny rules kisi broad allow ke upar hone chahiye.</li>
<li>Splash encryption nahi hai; open SSIDs hawa mein protected nahi hote.</li>
</ul></div>
`}};export{e as default};