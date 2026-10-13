var e={id:`guest`,h:{en:`Guest networks and captive portals`,hi:`Guest networks aur captive portals`},body:{en:`
<p>A hotel lets visitors use the lobby, the café and the Wi-Fi, but a visitor's key card does not open staff offices or the server room. The front desk hands out a card only after the visitor accepts the house rules. A guest wireless network is that lobby: useful, friendly, and walled off from everything that belongs to the business.</p>

<h3>What a guest network must do</h3>
<ul>
<li><b>Separate SSID and VLAN.</b> Guests join their own SSID (for example <code>CORP-GUEST</code>) mapped to a dedicated guest VLAN and subnet, never the staff VLAN.</li>
<li><b>Internet only.</b> An ACL or firewall policy on the guest VLAN's gateway permits internet access and DNS, and denies every internal subnet. Many designs send guest traffic straight to an internet edge or a separate firewall zone.</li>
<li><b>Client isolation.</b> Also called peer-to-peer blocking: guests cannot reach each other's devices on the same SSID, stopping one infected laptop from attacking others.</li>
<li><b>Limits.</b> Per-user bandwidth caps so guests cannot starve business traffic, session time limits, and a maximum number of clients.</li>
<li><b>Accountability.</b> A captive portal that records acceptance of terms, and optionally who the guest is.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Guest network isolation">
<rect x="20" y="30" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">CORP-OFFICE</text><text x="95" y="66" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20 staff</text>
<rect x="20" y="150" width="150" height="44" rx="8" fill="#fde68a"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="13">CORP-GUEST</text><text x="95" y="186" text-anchor="middle" class="svg-muted" font-size="12">VLAN 30 guest</text>
<rect x="250" y="90" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">Gateway / firewall</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">guest ACL</text>
<rect x="470" y="30" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="545" y="57" text-anchor="middle" class="svg-ink" font-size="13">Servers 10.30.50.0/24</text>
<rect x="470" y="150" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="545" y="177" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="170" y1="52" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="170" y1="172" x2="250" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="105" x2="470" y2="52" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="470" y2="172" stroke="#64748b" stroke-width="2"/>
<text x="440" y="95" class="svg-accent" font-size="12">guest: denied</text><text x="420" y="150" class="svg-accent" font-size="12">guest: allowed</text>
</svg><p class="cap">Staff and guests share the APs but not the VLAN, the subnet or the reachable destinations.</p></div>

<h3>Captive portals</h3>
<p>A <b>captive portal</b> is a web page a guest must pass before getting internet access. After the client associates and gets an IP address, the AP, controller or gateway intercepts its first web request and redirects it to the portal. Only after the guest completes the page does the system authorise that client's MAC address, usually for a limited time.</p>
<p>Common portal types:</p>
<ul>
<li><b>Click-through</b>: accept the acceptable use policy (AUP). Simple, legally useful.</li>
<li><b>Credentials or vouchers</b>: a username and password printed on a ticket or sent by SMS or email.</li>
<li><b>Sponsored access</b>: an employee approves the visitor.</li>
<li><b>Social or self-registration</b>: the guest registers with an email address or phone number.</li>
</ul>
<p>Modern phones and laptops detect captive portals automatically by trying to reach a known test page; when the response is a redirect, they pop up a mini browser. Two things to remember: a portal page itself should use HTTPS with a valid certificate, and the portal does <b>not encrypt</b> the wireless traffic. An open SSID with a portal is still unencrypted on the air, so combine the portal with <b>Enhanced Open (OWE)</b> or a simple WPA2/WPA3 guest key if eavesdropping matters.</p>

<h3>Configuration sketch</h3>
<pre class="code"><span class="c">! Controller: guest interface and open guest WLAN (portal added by the web-auth policy)</span>
config interface create guest 30
config interface address dynamic-interface guest 10.30.30.5 255.255.255.0 10.30.30.1
config wlan create 2 GUEST CORP-GUEST
config wlan interface 2 guest
config wlan security wpa disable 2
config wlan enable 2
<span class="c">! Gateway: guest VLAN may reach its gateway and the internet, not internal networks</span>
ip access-list extended GUEST-IN
 permit udp 10.30.30.0 0.0.0.255 any eq 53
 permit ip any host 10.30.30.1
 deny   ip 10.30.30.0 0.0.0.255 10.0.0.0 0.255.255.255
 deny   ip 10.30.30.0 0.0.0.255 172.16.0.0 0.15.255.255
 deny   ip 10.30.30.0 0.0.0.255 192.168.0.0 0.0.255.255
 permit ip any any
interface GigabitEthernet0/0.30
 ip access-group GUEST-IN in</pre>
<pre class="out">R1# show access-lists GUEST-IN
Extended IP access list GUEST-IN
    10 permit udp 10.30.30.0 0.0.0.255 any eq domain (412 matches)
    20 permit ip any host 10.30.30.1 (96 matches)
    <span class="hl">30 deny ip 10.30.30.0 0.0.0.255 10.0.0.0 0.255.255.255 (37 matches)</span>
    40 deny ip 10.30.30.0 0.0.0.255 172.16.0.0 0.15.255.255
    50 deny ip 10.30.30.0 0.0.0.255 192.168.0.0 0.0.255.255
    60 permit ip any any (5821 matches)</pre>
<p>The hits on line 30 show guests trying to reach internal addresses and being blocked, which is exactly what you want. ACLs are covered in depth in the security module.</p>

<div class="eg"><p><b>Worked example.</b> A clinic's waiting room has 40 guest devices. The design: SSID CORP-GUEST, VLAN 30, 10.30.30.0/24 (enough for 250 guests with short DHCP leases of 1 to 2 hours), click-through portal with a 4-hour session, 5 Mbps per client, client isolation on, ACL denying all RFC 1918 ranges. Staff tablets stay on WPA3-Enterprise in VLAN 20. The medical record system in 10.30.50.0/24 is unreachable from VLAN 30.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting the guest SSID in the staff VLAN "for now", or forgetting to allow DNS before the portal. Without DNS the client cannot even resolve the test page, so the portal never appears and guests report "Wi-Fi connected, no internet".</p></div>

<div class="exam"><p><b>Exam trap.</b> A captive portal provides authentication or acceptance of terms, not encryption. Guest isolation is achieved with a separate SSID and VLAN plus ACLs or firewall rules, and client (peer-to-peer) isolation stops guests reaching each other.</p></div>

<div class="scn"><h4>The guest who printed on the CEO's printer</h4><p>A visitor at a law firm sent a document to the executive floor's printer from the guest Wi-Fi. The engineer found the guest SSID mapped to the same VLAN as the office printers "temporarily" since a migration. He created VLAN 30 for guests, applied an internet-only ACL at the gateway, enabled client isolation and added a click-through portal logging each session.</p><p><b>Lesson:</b> a guest network is only as isolated as its VLAN and its ACL.</p></div>

<div class="iv"><p class="q">"How would you design a secure guest wireless network?"</p><p>Strong answer: a dedicated guest SSID mapped to its own VLAN and subnet; gateway ACL or firewall allowing DNS and internet but denying all internal ranges; client isolation; captive portal for terms acceptance or sponsored credentials with session timeouts; per-client bandwidth limits; short DHCP leases; and Enhanced Open or a guest key if you want encryption, because a portal does not encrypt. Mention logging for accountability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guests get their own SSID, VLAN and subnet, with internet-only ACLs or firewall rules.</li>
<li>Client isolation stops guests attacking each other on the same SSID.</li>
<li>Captive portals redirect the first web request to a terms, voucher or sponsor page, then authorise the client for a limited time.</li>
<li>A captive portal does not encrypt; add Enhanced Open or a guest key if needed.</li>
<li>Allow DNS before portal login, cap bandwidth and use short DHCP leases.</li>
</ul></div>
`,hi:`
<p>Ek hotel visitors ko lobby, café aur Wi-Fi use karne deta hai, par visitor ka key card staff offices ya server room nahi kholta. Front desk card tabhi deta hai jab visitor ghar ke niyam maan le. Guest wireless network wahi lobby hai: useful, friendly, aur business ki har cheez se deewar se alag.</p>

<h3>Guest network ko kya karna chahiye</h3>
<ul>
<li><b>Alag SSID aur VLAN.</b> Guests apna SSID join karte hain (jaise <code>CORP-GUEST</code>) jo dedicated guest VLAN aur subnet se mapped hai, kabhi staff VLAN nahi.</li>
<li><b>Sirf internet.</b> Guest VLAN ke gateway par ACL ya firewall policy internet access aur DNS allow karti hai, aur har internal subnet deny karti hai. Kai designs guest traffic seedha internet edge ya alag firewall zone par bhejte hain.</li>
<li><b>Client isolation.</b> Ise peer-to-peer blocking bhi kehte hain: guests same SSID par ek doosre ke devices tak nahi pahunch sakte, jisse ek infected laptop doosron par attack nahi kar paata.</li>
<li><b>Limits.</b> Per-user bandwidth caps taaki guests business traffic ko bhooka na maarein, session time limits, aur clients ki maximum sankhya.</li>
<li><b>Accountability.</b> Captive portal jo terms maanne ka record rakhta hai, aur optionally guest kaun hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Guest network isolation">
<rect x="20" y="30" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">CORP-OFFICE</text><text x="95" y="66" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20 staff</text>
<rect x="20" y="150" width="150" height="44" rx="8" fill="#fde68a"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="13">CORP-GUEST</text><text x="95" y="186" text-anchor="middle" class="svg-muted" font-size="12">VLAN 30 guest</text>
<rect x="250" y="90" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">Gateway / firewall</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">guest ACL</text>
<rect x="470" y="30" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="545" y="57" text-anchor="middle" class="svg-ink" font-size="13">Servers 10.30.50.0/24</text>
<rect x="470" y="150" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="545" y="177" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="170" y1="52" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="170" y1="172" x2="250" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="105" x2="470" y2="52" stroke="#64748b" stroke-width="2"/><line x1="390" y1="125" x2="470" y2="172" stroke="#64748b" stroke-width="2"/>
<text x="440" y="95" class="svg-accent" font-size="12">guest: denied</text><text x="420" y="150" class="svg-accent" font-size="12">guest: allowed</text>
</svg><p class="cap">Staff aur guests APs share karte hain par VLAN, subnet ya reachable destinations nahi.</p></div>

<h3>Captive portals</h3>
<p><b>Captive portal</b> ek web page hai jise guest ko internet access se pehle paar karna padta hai. Client associate hokar IP address lene ke baad, AP, controller ya gateway uski pehli web request intercept karke use portal par redirect karta hai. Guest ke page complete karne ke baad hi system us client ke MAC address ko authorise karta hai, aam taur par seemit samay ke liye.</p>
<p>Common portal types:</p>
<ul>
<li><b>Click-through</b>: acceptable use policy (AUP) accept karo. Simple, legally useful.</li>
<li><b>Credentials ya vouchers</b>: ticket par print kiya ya SMS ya email se bheja username aur password.</li>
<li><b>Sponsored access</b>: ek employee visitor ko approve karta hai.</li>
<li><b>Social ya self-registration</b>: guest email address ya phone number se register karta hai.</li>
</ul>
<p>Modern phones aur laptops ek known test page tak pahunchne ki koshish karke captive portals apne aap detect karte hain; jab response redirect hota hai, woh ek mini browser khol dete hain. Do baatein yaad rakho: portal page khud valid certificate ke saath HTTPS use kare, aur portal wireless traffic ko <b>encrypt nahi</b> karta. Portal wala open SSID hawa par phir bhi unencrypted hai, isliye agar eavesdropping matter karti hai to portal ko <b>Enhanced Open (OWE)</b> ya simple WPA2/WPA3 guest key ke saath jodo.</p>

<h3>Configuration sketch</h3>
<pre class="code"><span class="c">! Controller: guest interface aur open guest WLAN (portal web-auth policy se judta hai)</span>
config interface create guest 30
config interface address dynamic-interface guest 10.30.30.5 255.255.255.0 10.30.30.1
config wlan create 2 GUEST CORP-GUEST
config wlan interface 2 guest
config wlan security wpa disable 2
config wlan enable 2
<span class="c">! Gateway: guest VLAN apne gateway aur internet tak pahunch sakta hai, internal networks tak nahi</span>
ip access-list extended GUEST-IN
 permit udp 10.30.30.0 0.0.0.255 any eq 53
 permit ip any host 10.30.30.1
 deny   ip 10.30.30.0 0.0.0.255 10.0.0.0 0.255.255.255
 deny   ip 10.30.30.0 0.0.0.255 172.16.0.0 0.15.255.255
 deny   ip 10.30.30.0 0.0.0.255 192.168.0.0 0.0.255.255
 permit ip any any
interface GigabitEthernet0/0.30
 ip access-group GUEST-IN in</pre>
<pre class="out">R1# show access-lists GUEST-IN
Extended IP access list GUEST-IN
    10 permit udp 10.30.30.0 0.0.0.255 any eq domain (412 matches)
    20 permit ip any host 10.30.30.1 (96 matches)
    <span class="hl">30 deny ip 10.30.30.0 0.0.0.255 10.0.0.0 0.255.255.255 (37 matches)</span>
    40 deny ip 10.30.30.0 0.0.0.255 172.16.0.0 0.15.255.255
    50 deny ip 10.30.30.0 0.0.0.255 192.168.0.0 0.0.255.255
    60 permit ip any any (5821 matches)</pre>
<p>Line 30 ke hits dikhate hain ki guests internal addresses tak pahunchne ki koshish kar rahe hain aur block ho rahe hain, bilkul wahi jo aap chahte ho. ACLs security module mein detail mein cover hote hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek clinic ke waiting room mein 40 guest devices hain. Design: SSID CORP-GUEST, VLAN 30, 10.30.30.0/24 (1 se 2 ghante ki chhoti DHCP leases ke saath 250 guests ke liye kaafi), 4 ghante ke session ke saath click-through portal, har client 5 Mbps, client isolation on, saari RFC 1918 ranges deny karne wala ACL. Staff tablets VLAN 20 mein WPA3-Enterprise par rehte hain. 10.30.50.0/24 mein medical record system VLAN 30 se unreachable hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Guest SSID ko "abhi ke liye" staff VLAN mein daalna, ya portal se pehle DNS allow karna bhool jaana. DNS ke bina client test page resolve hi nahi kar paata, isliye portal kabhi dikhta nahi aur guests report karte hain "Wi-Fi connected, internet nahi".</p></div>

<div class="exam"><p><b>Exam trap.</b> Captive portal authentication ya terms ki sweekriti deta hai, encryption nahi. Guest isolation alag SSID aur VLAN plus ACLs ya firewall rules se hota hai, aur client (peer-to-peer) isolation guests ko ek doosre tak pahunchne se rokta hai.</p></div>

<div class="scn"><h4>Guest jisne CEO ke printer par print kiya</h4><p>Ek law firm mein ek visitor ne guest Wi-Fi se executive floor ke printer par document bhej diya. Engineer ne paaya ki ek migration ke baad se guest SSID "temporarily" office printers wale same VLAN se mapped tha. Usne guests ke liye VLAN 30 banaya, gateway par internet-only ACL lagaya, client isolation enable kiya aur har session log karne wala click-through portal joda.</p><p><b>Seekh:</b> guest network utna hi isolated hai jitna uska VLAN aur uska ACL.</p></div>

<div class="iv"><p class="q">"Aap secure guest wireless network kaise design karoge?"</p><p>Strong answer: apne VLAN aur subnet se mapped dedicated guest SSID; gateway ACL ya firewall jo DNS aur internet allow kare par saari internal ranges deny kare; client isolation; terms acceptance ya sponsored credentials ke liye session timeouts wala captive portal; per-client bandwidth limits; chhoti DHCP leases; aur encryption chahiye to Enhanced Open ya guest key, kyunki portal encrypt nahi karta. Accountability ke liye logging ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guests ko apna SSID, VLAN aur subnet milta hai, internet-only ACLs ya firewall rules ke saath.</li>
<li>Client isolation guests ko same SSID par ek doosre par attack karne se rokta hai.</li>
<li>Captive portals pehli web request ko terms, voucher ya sponsor page par redirect karte hain, phir client ko seemit samay ke liye authorise karte hain.</li>
<li>Captive portal encrypt nahi karta; zaroorat ho to Enhanced Open ya guest key jodo.</li>
<li>Portal login se pehle DNS allow karo, bandwidth cap karo aur chhoti DHCP leases use karo.</li>
</ul></div>
`}};export{e as default};