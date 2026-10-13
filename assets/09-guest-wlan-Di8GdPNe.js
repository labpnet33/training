var e={id:`guest-wlan`,h:{en:`Guest WLANs: isolation, web authentication and the guest VLAN`,hi:`Guest WLANs: isolation, web authentication aur guest VLAN`},body:{en:`
<p>A company lobby has a comfortable waiting area for visitors with a coffee machine and a television. Visitors can use it freely, but a locked door and a security guard keep them out of the offices, and they certainly cannot wander into the server room. A guest WLAN is that waiting area: easy to join, internet only, and with a solid wall between the guests and everything internal. Building that wall correctly is what this chapter is about, and getting it wrong is exactly what the module's troubleshooting lab shows.</p>

<h3>What a guest WLAN must achieve</h3>
<ol>
<li><b>Isolation</b>: guests reach the internet, never internal subnets such as the servers in 10.10.50.0/24 or staff VLANs.</li>
<li><b>Easy onboarding</b>: no IT involvement for each visitor; often an open SSID or a simple daily passphrase.</li>
<li><b>Accountability</b>: acceptance of terms of use, or a temporary account, so the company knows who used its connection.</li>
<li><b>Fairness</b>: guests must not starve staff of airtime or bandwidth.</li>
</ol>

<h3>Building blocks on the WLC</h3>
<dl class="terms">
<dt>Separate dynamic interface and VLAN</dt><dd>The guest WLAN maps to its own interface (lab: <code>guest</code>, VLAN 30, 10.10.30.0/24). The gateway (R1 Gi0/0.30) applies an ACL that permits the internet and denies internal ranges.</dd>
<dt>Layer 3 web authentication</dt><dd>Security &gt; Layer 3: the client associates, gets an IP, and its first web request is redirected to a login or terms page served from the WLC's <b>virtual interface</b> (192.0.2.1). Variants: <i>Authentication</i> (username/password, often temporary accounts created by a lobby ambassador), <i>Passthrough</i> (just accept the terms), and external web auth on a server such as Cisco ISE.</dd>
<dt>Peer-to-peer (P2P) blocking</dt><dd>Advanced tab: stops guest devices talking to each other through the WLC.</dd>
<dt>QoS Bronze and rate limits</dt><dd>Keep guest traffic in the background class so staff voice and video win.</dd>
<dt>Guest anchor controller</dt><dd>In large networks, guest traffic from all internal WLCs is tunnelled to a dedicated <b>anchor WLC in the DMZ</b>, so guest packets never touch an internal VLAN at all.</dd>
<dt>WPA3 Enhanced Open (OWE)</dt><dd>Encrypts an open network per client without any password, so guests are protected from sniffing on an open SSID.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Guest isolation in the lab">
<rect x="20" y="100" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="13">PHONE1</text><text x="80" y="140" text-anchor="middle" class="svg-muted" font-size="12">NK-GUEST</text>
<rect x="180" y="100" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="240" y="122" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="240" y="140" text-anchor="middle" class="svg-muted" font-size="12">if guest VLAN 30</text>
<rect x="340" y="100" width="120" height="50" rx="8" fill="#fde68a"/><text x="400" y="122" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0.30</text><text x="400" y="140" text-anchor="middle" class="svg-muted" font-size="12">ACL GUEST-IN</text>
<rect x="500" y="30" width="125" height="46" rx="8" fill="#bbf7d0"/><text x="562" y="52" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="562" y="68" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<rect x="500" y="175" width="125" height="46" rx="8" fill="#fed7aa"/><text x="562" y="197" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="562" y="213" text-anchor="middle" class="svg-muted" font-size="12">10.10.50.10</text>
<line x1="140" y1="125" x2="180" y2="125" stroke="#64748b" stroke-width="2"/><line x1="300" y1="125" x2="340" y2="125" stroke="#64748b" stroke-width="3"/>
<line x1="460" y1="115" x2="500" y2="60" stroke="#64748b" stroke-width="2"/><text x="505" y="100" class="svg-accent" font-size="12">permit</text>
<line x1="460" y1="135" x2="500" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="470" y="175" class="svg-accent" font-size="12">deny</text>
</svg><p class="cap">Guests land in VLAN 30; the gateway ACL lets them out to the internet and blocks every 10.10.x.x destination.</p></div>

<h3>The lab design, step by step</h3>
<pre class="code"><span class="c">! R1: the guest gateway filters inbound traffic from VLAN 30</span>
interface GigabitEthernet0/0.30
 description GUEST-WLAN
 encapsulation dot1Q 30
 ip address 10.10.30.1 255.255.255.0
 ip access-group GUEST-IN in
ip access-list extended GUEST-IN
 permit ip any host 10.10.30.1
 deny   ip 10.10.30.0 0.0.0.255 10.10.0.0 0.0.255.255
 permit ip any any
ip dhcp pool GUEST
 network 10.10.30.0 255.255.255.0
 default-router 10.10.30.1
 dns-server 203.0.113.53</pre>
<p>Line 1 lets guests talk to their own gateway, line 2 blocks anything internal, line 3 allows the internet. Guests also receive a <b>public DNS server</b>, never the internal one (10.10.50.10).</p>
<pre class="code"><span class="c">! WLC1: guest interface and open guest WLAN</span>
(WLC1) &gt;config interface create guest 30
(WLC1) &gt;config interface address dynamic-interface guest 10.10.30.5 255.255.255.0 10.10.30.1
(WLC1) &gt;config interface dhcp dynamic-interface guest primary 10.10.30.1
(WLC1) &gt;config wlan create 3 GUEST NK-GUEST
(WLC1) &gt;config wlan interface 3 guest
(WLC1) &gt;config wlan security wpa disable 3
(WLC1) &gt;config wlan enable 3
<span class="c">! on a real controller you would typically add:</span>
<span class="c">! config wlan security web-auth enable 3     (Layer 3 login page)</span>
<span class="c">! config wlan peer-blocking drop 3          (P2P blocking)</span>
<span class="c">! config wlan qos 3 bronze                  (background QoS)</span></pre>

<pre class="out">(WLC1) &gt;show wlan summary

Number of WLANs.................................. 2

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
1        STAFF / NK-STAFF                  Enabled   staff             WPA2-Personal (PSK)
<span class="hl">3        GUEST / NK-GUEST                  Enabled   guest             Open</span></pre>

<div class="eg"><p><b>Worked example.</b> PHONE1 joins NK-GUEST and gets 10.10.30.22. It pings 203.0.113.10: the packet enters R1 Gi0/0.30, line 2 does not match (destination is not 10.10.x.x), line 3 permits it. It then tries 10.10.50.10: line 2 matches (source 10.10.30.22 in 10.10.30.0/24, destination in 10.10.0.0/16), so the packet is dropped. If the guest WLAN were mapped to the <b>staff</b> interface by mistake, PHONE1 would get 10.10.20.x instead, the ACL on .30 would never see it, and the file server would be wide open.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Mapping the guest WLAN to the staff or management interface "temporarily". Hiding the guest SSID and calling it security (any device with a saved profile, or a sniffer, finds it). Giving guests the internal DNS server, which leaks internal host names. Creating a guest interface in a VLAN that does not exist on the switch.</p></div>

<div class="exam"><p><b>Exam trap.</b> Web authentication is a <b>Layer 3</b> security option; WPA2/WPA3 are <b>Layer 2</b>. The login page is served from the WLC's <b>virtual interface</b>. Disabling SSID broadcast is <b>not</b> a security control. Guest isolation is achieved by VLAN plus ACL (or an anchor controller), not by the SSID name.</p></div>

<div class="scn"><h4>The audit finding: visitors can open the file server</h4><p>A security audit reported that a visitor phone on NK-GUEST could browse the internal file server SRV1. Visitors also complained they could not see NK-GUEST in their Wi-Fi list. The engineer found three faults on WLC1: WLAN 3 was mapped to interface <code>staff</code> (so guests received 10.10.20.x staff addresses and bypassed the guest ACL), SSID broadcast was disabled, and the guest dynamic interface had been created in VLAN 31, which did not exist on SW1. Fixing all three put guests back in 10.10.30.0/24 behind ACL GUEST-IN. Chapter 11 walks through this ticket command by command.</p><p><b>Lesson:</b> guest isolation depends on the WLAN-to-interface mapping and the VLAN behind it. One wrong drop-down on the General tab can expose the whole internal network.</p></div>

<div class="iv"><p class="q">"How would you design a secure guest wireless network on a controller?"</p><p>Strong answer: a separate guest WLAN mapped to its own dynamic interface and VLAN, with an ACL or firewall at the gateway allowing internet only and denying all internal ranges; a public DNS server; Layer 3 web authentication with terms or temporary accounts; P2P blocking; Bronze QoS or rate limits. In larger or high-security networks, tunnel guest traffic to an anchor WLC in the DMZ. Optionally use WPA3 Enhanced Open (OWE) for encryption without a password. Mention verifying by testing from a guest device that internal hosts are unreachable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest WLAN = own dynamic interface and VLAN plus an ACL/firewall allowing internet only.</li>
<li>Layer 3 web authentication redirects guests to a login or terms page on the virtual interface.</li>
<li>P2P blocking, Bronze QoS and a public DNS server complete the design.</li>
<li>Large networks anchor guest traffic to a DMZ controller.</li>
<li>Hiding the SSID is not security; the interface mapping is what isolates guests.</li>
</ul></div>
`,hi:`
<p>Ek company ki lobby mein visitors ke liye coffee machine aur television wala aaramdayak waiting area hai. Visitors ise freely use kar sakte hain, lekin ek locked darwaza aur security guard unhe offices se bahar rakhte hain, aur woh server room mein to bilkul nahi ghoom sakte. Guest WLAN wahi waiting area hai: join karna aasaan, sirf internet, aur guests aur har internal cheez ke beech ek mazboot deewar. Woh deewar sahi banana is chapter ka topic hai, aur use galat banana hi module ka troubleshooting lab dikhata hai.</p>

<h3>Guest WLAN ko kya achieve karna chahiye</h3>
<ol>
<li><b>Isolation</b>: guests internet tak pahunchte hain, kabhi internal subnets tak nahi jaise 10.10.50.0/24 ke servers ya staff VLANs.</li>
<li><b>Aasaan onboarding</b>: har visitor ke liye IT ki zaroorat nahi; aksar open SSID ya simple daily passphrase.</li>
<li><b>Accountability</b>: terms of use accept karna, ya temporary account, taaki company ko pata ho ki uska connection kisne use kiya.</li>
<li><b>Fairness</b>: guests staff ka airtime ya bandwidth na kha jaayein.</li>
</ol>

<h3>WLC par building blocks</h3>
<dl class="terms">
<dt>Alag dynamic interface aur VLAN</dt><dd>Guest WLAN apne interface se map hota hai (lab: <code>guest</code>, VLAN 30, 10.10.30.0/24). Gateway (R1 Gi0/0.30) ek ACL lagata hai jo internet permit karta hai aur internal ranges deny karta hai.</dd>
<dt>Layer 3 web authentication</dt><dd>Security &gt; Layer 3: client associate hota hai, IP leta hai, aur uski pehli web request WLC ke <b>virtual interface</b> (192.0.2.1) se serve hone wale login ya terms page par redirect hoti hai. Variants: <i>Authentication</i> (username/password, aksar lobby ambassador ke banaye temporary accounts), <i>Passthrough</i> (bas terms accept karo), aur Cisco ISE jaise server par external web auth.</dd>
<dt>Peer-to-peer (P2P) blocking</dt><dd>Advanced tab: guest devices ko WLC ke through aapas mein baat karne se rokta hai.</dd>
<dt>QoS Bronze aur rate limits</dt><dd>Guest traffic ko background class mein rakho taaki staff voice aur video jeetein.</dd>
<dt>Guest anchor controller</dt><dd>Bade networks mein saare internal WLCs ka guest traffic <b>DMZ mein ek dedicated anchor WLC</b> tak tunnel hota hai, taaki guest packets kabhi kisi internal VLAN ko chhuein hi nahi.</dd>
<dt>WPA3 Enhanced Open (OWE)</dt><dd>Open network ko bina kisi password ke har client ke liye encrypt karta hai, taaki open SSID par guests sniffing se bache rahein.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab mein guest isolation">
<rect x="20" y="100" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="13">PHONE1</text><text x="80" y="140" text-anchor="middle" class="svg-muted" font-size="12">NK-GUEST</text>
<rect x="180" y="100" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="240" y="122" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="240" y="140" text-anchor="middle" class="svg-muted" font-size="12">if guest VLAN 30</text>
<rect x="340" y="100" width="120" height="50" rx="8" fill="#fde68a"/><text x="400" y="122" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0.30</text><text x="400" y="140" text-anchor="middle" class="svg-muted" font-size="12">ACL GUEST-IN</text>
<rect x="500" y="30" width="125" height="46" rx="8" fill="#bbf7d0"/><text x="562" y="52" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="562" y="68" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<rect x="500" y="175" width="125" height="46" rx="8" fill="#fed7aa"/><text x="562" y="197" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="562" y="213" text-anchor="middle" class="svg-muted" font-size="12">10.10.50.10</text>
<line x1="140" y1="125" x2="180" y2="125" stroke="#64748b" stroke-width="2"/><line x1="300" y1="125" x2="340" y2="125" stroke="#64748b" stroke-width="3"/>
<line x1="460" y1="115" x2="500" y2="60" stroke="#64748b" stroke-width="2"/><text x="505" y="100" class="svg-accent" font-size="12">permit</text>
<line x1="460" y1="135" x2="500" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="470" y="175" class="svg-accent" font-size="12">deny</text>
</svg><p class="cap">Guests VLAN 30 mein aate hain; gateway ACL unhe internet tak jaane deta hai aur har 10.10.x.x destination block karta hai.</p></div>

<h3>Lab design, step by step</h3>
<pre class="code"><span class="c">! R1: guest gateway VLAN 30 se aane wala traffic filter karta hai</span>
interface GigabitEthernet0/0.30
 description GUEST-WLAN
 encapsulation dot1Q 30
 ip address 10.10.30.1 255.255.255.0
 ip access-group GUEST-IN in
ip access-list extended GUEST-IN
 permit ip any host 10.10.30.1
 deny   ip 10.10.30.0 0.0.0.255 10.10.0.0 0.0.255.255
 permit ip any any
ip dhcp pool GUEST
 network 10.10.30.0 255.255.255.0
 default-router 10.10.30.1
 dns-server 203.0.113.53</pre>
<p>Line 1 guests ko apne gateway se baat karne deti hai, line 2 kuch bhi internal block karti hai, line 3 internet allow karti hai. Guests ko <b>public DNS server</b> bhi milta hai, internal wala (10.10.50.10) kabhi nahi.</p>
<pre class="code"><span class="c">! WLC1: guest interface aur open guest WLAN</span>
(WLC1) &gt;config interface create guest 30
(WLC1) &gt;config interface address dynamic-interface guest 10.10.30.5 255.255.255.0 10.10.30.1
(WLC1) &gt;config interface dhcp dynamic-interface guest primary 10.10.30.1
(WLC1) &gt;config wlan create 3 GUEST NK-GUEST
(WLC1) &gt;config wlan interface 3 guest
(WLC1) &gt;config wlan security wpa disable 3
(WLC1) &gt;config wlan enable 3
<span class="c">! real controller par aap aam taur par yeh bhi jodoge:</span>
<span class="c">! config wlan security web-auth enable 3     (Layer 3 login page)</span>
<span class="c">! config wlan peer-blocking drop 3          (P2P blocking)</span>
<span class="c">! config wlan qos 3 bronze                  (background QoS)</span></pre>

<pre class="out">(WLC1) &gt;show wlan summary

Number of WLANs.................................. 2

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
1        STAFF / NK-STAFF                  Enabled   staff             WPA2-Personal (PSK)
<span class="hl">3        GUEST / NK-GUEST                  Enabled   guest             Open</span></pre>

<div class="eg"><p><b>Worked example.</b> PHONE1 NK-GUEST join karta hai aur 10.10.30.22 paata hai. Woh 203.0.113.10 ping karta hai: packet R1 Gi0/0.30 mein aata hai, line 2 match nahi karti (destination 10.10.x.x nahi hai), line 3 permit karti hai. Phir woh 10.10.50.10 try karta hai: line 2 match karti hai (source 10.10.30.22 10.10.30.0/24 mein, destination 10.10.0.0/16 mein), isliye packet drop hota hai. Agar guest WLAN galti se <b>staff</b> interface se map hota, PHONE1 ko 10.10.20.x milta, .30 wala ACL use kabhi dekhta hi nahi, aur file server poora khula hota.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Guest WLAN ko "temporarily" staff ya management interface se map karna. Guest SSID chhupa kar use security kehna (saved profile wala koi bhi device, ya sniffer, use dhoondh leta hai). Guests ko internal DNS server dena, jo internal host names leak karta hai. Aise VLAN mein guest interface banana jo switch par exist hi nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Web authentication <b>Layer 3</b> security option hai; WPA2/WPA3 <b>Layer 2</b> hain. Login page WLC ke <b>virtual interface</b> se serve hota hai. SSID broadcast disable karna security control <b>nahi</b> hai. Guest isolation VLAN plus ACL (ya anchor controller) se hoti hai, SSID naam se nahi.</p></div>

<div class="scn"><h4>Audit finding: visitors file server khol sakte hain</h4><p>Ek security audit ne report kiya ki NK-GUEST par ek visitor phone internal file server SRV1 browse kar sakta tha. Visitors ne yeh bhi shikayat ki ki unhe Wi-Fi list mein NK-GUEST dikhta hi nahi. Engineer ko WLC1 par teen faults mile: WLAN 3 interface <code>staff</code> se mapped tha (isliye guests ko 10.10.20.x staff addresses milte the aur woh guest ACL bypass karte the), SSID broadcast disabled tha, aur guest dynamic interface VLAN 31 mein bana tha, jo SW1 par exist nahi karta tha. Teeno fix karne se guests wapas 10.10.30.0/24 mein ACL GUEST-IN ke peeche aa gaye. Chapter 11 is ticket ko command by command walk karta hai.</p><p><b>Seekh:</b> guest isolation WLAN-to-interface mapping aur uske peeche ke VLAN par depend karti hai. General tab ka ek galat drop-down poore internal network ko expose kar sakta hai.</p></div>

<div class="iv"><p class="q">"Controller par secure guest wireless network kaise design karoge?"</p><p>Strong answer: alag guest WLAN jo apne dynamic interface aur VLAN se mapped ho, gateway par ACL ya firewall jo sirf internet allow kare aur saari internal ranges deny kare; public DNS server; terms ya temporary accounts ke saath Layer 3 web authentication; P2P blocking; Bronze QoS ya rate limits. Bade ya high-security networks mein guest traffic ko DMZ ke anchor WLC tak tunnel karo. Optionally bina password encryption ke liye WPA3 Enhanced Open (OWE) use karo. Batao ki guest device se test karke verify karoge ki internal hosts unreachable hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest WLAN = apna dynamic interface aur VLAN plus sirf internet allow karne wala ACL/firewall.</li>
<li>Layer 3 web authentication guests ko virtual interface par login ya terms page par redirect karta hai.</li>
<li>P2P blocking, Bronze QoS aur public DNS server design poora karte hain.</li>
<li>Bade networks guest traffic ko DMZ controller par anchor karte hain.</li>
<li>SSID chhupana security nahi hai; interface mapping hi guests ko isolate karti hai.</li>
</ul></div>
`}};export{e as default};