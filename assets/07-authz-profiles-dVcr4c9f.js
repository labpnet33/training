var e={id:`authz-profiles`,h:{en:`Authorization profiles: VLAN, downloadable ACL, redirect and timers`,hi:`Authorization profiles: VLAN, downloadable ACL, redirect aur timers`},body:{en:`
<p>A hotel key card can be programmed in several ways at once: which floor the lift goes to, which doors open, and when the card expires. An ISE <b>authorization profile</b> is that programming. It is a bundle of RADIUS attributes that ISE puts into the Access-Accept, and the switch applies them to the port.</p>

<h3>What a profile can contain</h3>
<table class="cmp"><tr><th>Result</th><th>RADIUS attribute(s) sent</th><th>Effect on the switch</th></tr>
<tr><td>Access type</td><td>ACCESS_ACCEPT or ACCESS_REJECT</td><td>Permit or deny the session</td></tr>
<tr><td>VLAN</td><td>Tunnel-Type (64) = VLAN, Tunnel-Medium-Type (65) = 802, Tunnel-Private-Group-ID (81) = 20</td><td>Port moved to VLAN 20 (by ID or by name)</td></tr>
<tr><td>Downloadable ACL (dACL)</td><td>cisco-av-pair ACS:CiscoSecure-Defined-ACL = name of the dACL</td><td>Switch downloads the ACL body from ISE and applies it to that session</td></tr>
<tr><td>Filter-ID</td><td>Filter-Id (11) = STAFF-ACL.in</td><td>Applies an ACL that already exists on the switch</td></tr>
<tr><td>Web redirection</td><td>cisco-av-pair url-redirect and url-redirect-acl</td><td>Sends web traffic to an ISE portal (guest, posture, BYOD)</td></tr>
<tr><td>Security group</td><td>cisco-av-pair cts:security-group-tag = 0028-00</td><td>Assigns SGT 40 (0x28) to the session (chapter 8)</td></tr>
<tr><td>Voice domain</td><td>cisco-av-pair device-traffic-class = voice</td><td>Puts an IP phone into the voice VLAN on a multi-domain port</td></tr>
<tr><td>Reauthentication</td><td>Session-Timeout (27) and Termination-Action (29)</td><td>Forces periodic re-authentication without losing the session</td></tr>
</table>
<p>For wireless, <b>Airespace ACL Name</b> refers to an ACL defined on the WLC, and the VLAN is often sent as an interface name. Built-in profiles are <b>PermitAccess</b> and <b>DenyAccess</b>; Cisco_WebAuth is a ready-made redirect profile.</p>

<h3>VLAN assignment</h3>
<p>VLAN assignment is coarse but simple: different VLANs mean different subnets, so firewalls and routers can treat the groups differently. Its weakness is that the endpoint must get an IP in the new VLAN; if the VLAN changes after DHCP, the endpoint keeps a wrong address until it renews. That is why a VLAN change through CoA often uses <b>port bounce</b> (chapter 10).</p>

<h3>Downloadable ACLs</h3>
<p>A dACL is defined once in ISE (Policy &gt; Policy Elements &gt; Results &gt; Authorization &gt; Downloadable ACLs) and pushed to any switch on demand. The switch receives the ACL name in the Access-Accept, sends a second RADIUS request to fetch its contents, and applies it per session. Because the dACL is written with <code>any</code> as the source, the switch replaces <code>any</code> with the endpoint's IP, which it learns through <b>device tracking</b> (formerly IP device tracking). Without device tracking, dACLs fail on many platforms.</p>

<pre class="code"><span class="c">! dACL body in ISE: STAFF_DACL</span>
permit udp any any eq 67
permit udp any any eq 53
permit tcp any host 10.20.30.40 eq 443
deny ip any 10.99.99.0 0.0.0.255
permit ip any any

<span class="c">! on the switch: learn endpoint IPs for dACL source substitution</span>
device-tracking policy NK-DT
 tracking enable
interface range g0/1 - 3
 device-tracking attach-policy NK-DT</pre>

<pre class="out">ACC-SW1# show access-session interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0201
         IPv4 Address:  10.20.20.10
            User-Name:  priya
               Status:  Authorized
Server Policies:
           Vlan Group:  Vlan: 20
<span class="hl">              ACS ACL:  xACSACLx-IP-STAFF_DACL-61a7b3c2</span>

ACC-SW1# show ip access-lists xACSACLx-IP-STAFF_DACL-61a7b3c2
Extended IP access list xACSACLx-IP-STAFF_DACL-61a7b3c2 (per-user)
    1 permit udp any any eq bootps
    2 permit udp any any eq domain
    3 permit tcp any host 10.20.30.40 eq 443
<span class="hl">    4 deny ip any 10.99.99.0 0.0.0.255</span>
    5 permit ip any any</pre>

<h3>Redirect profiles</h3>
<p>A redirect profile returns two things: <b>url-redirect</b> (the ISE portal on the PSN, port 8443 by default) and <b>url-redirect-acl</b>, the name of an ACL on the switch. In that redirect ACL, <b>permit</b> means "redirect this traffic" and <b>deny</b> means "do not redirect" (let DNS, DHCP and traffic to ISE pass). The switch also needs its own web server enabled (<code>ip h&#116;tp server</code> and <code>ip h&#116;tp secure-server</code>) to intercept web sessions. Redirect is how central WebAuth, posture provisioning and BYOD onboarding start.</p>

<h3>Reauthentication timers</h3>
<p>With <code>authentication periodic</code> and <code>authentication timer reauthenticate server</code> on the port, the switch uses the Session-Timeout that ISE sends. Reauthentication is seamless for a supplicant and lets ISE re-evaluate policy regularly, for example every 8 hours for staff, every 1 hour for guests.</p>

<div class="eg"><p><b>Worked example.</b> Contractors must reach only the ticketing web server 10.20.30.40 on TCP 443, DNS and DHCP. Option 1: a contractor VLAN 30 plus firewall rules, which needs a new subnet on every floor. Option 2: keep them in VLAN 20 and return the dACL CONTRACTOR_DACL (four lines). Option 2 needs no new subnets and the same dACL works on all 600 switches, because ISE pushes it on demand. The dACL name the switch shows ends with a version hash; when you edit the dACL in ISE, the hash changes and switches download the new version on the next authentication.</p></div>

<div class="warn"><p><b>Common mistake.</b> Returning a VLAN by name when the VLAN name differs between switches ("STAFF" on one, "Staff" on another), or returning a VLAN that does not exist on the switch. The session fails authorization and the switch logs a VLAN assignment error. Keep VLAN names and IDs consistent, or use numbers.</p></div>

<div class="exam"><p><b>Exam trap.</b> In a redirect ACL, <b>permit = redirect</b>, deny = do not redirect. A dACL is downloaded from ISE; a Filter-ID or Airespace ACL must already exist on the switch or WLC. VLAN assignment uses three Tunnel attributes, 64, 65 and 81.</p></div>

<div class="scn"><h4>The dACL that blocked nothing</h4><p>A security audit found that guest sessions on one switch model could reach internal servers although ISE returned a strict GUEST_DACL. On those switches, <code>show access-session</code> showed the ACS ACL, but <code>show ip access-lists</code> showed the entries still with <code>any</code> as source and zero matches, and device tracking was disabled after a template change. Re-attaching the device-tracking policy made the switch learn guest IPs and substitute them, and the hit counters started climbing.</p><p><b>Lesson:</b> a dACL needs device tracking to bind to the endpoint's IP; verify with hit counters, not just the presence of the ACL name.</p></div>

<div class="iv"><p class="q">"When would you use a dACL instead of VLAN assignment?"</p><p>Strong answer: VLAN assignment changes the subnet and is good for large groups that downstream devices treat differently, but it needs addressing per VLAN and a re-DHCP on change. A dACL keeps the endpoint in its VLAN and applies per-session filtering defined centrally in ISE, pushed to any switch on demand, so it scales without new subnets. Mention that dACLs need device tracking, and that SGTs are the scalable next step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An authorization profile is a bundle of RADIUS attributes in the Access-Accept.</li>
<li>VLAN: Tunnel attributes 64/65/81; changing it later usually needs a port bounce for new DHCP.</li>
<li>dACL: defined in ISE, downloaded per session, needs device tracking for source substitution.</li>
<li>Redirect: url-redirect plus url-redirect-acl, where permit means redirect; the switch needs its web server enabled.</li>
<li>Session-Timeout with Termination-Action gives server-driven periodic reauthentication.</li>
</ul></div>
`,hi:`
<p>Hotel ka key card ek saath kai tarah se program ho sakta hai: lift kis floor par jaaye, kaunse darwaze khulein, aur card kab expire ho. ISE ka <b>authorization profile</b> wahi programming hai. Yeh RADIUS attributes ka ek bundle hai jise ISE Access-Accept mein daalta hai, aur switch unhe port par apply karta hai.</p>

<h3>Profile mein kya ho sakta hai</h3>
<table class="cmp"><tr><th>Result</th><th>Bheje gaye RADIUS attribute(s)</th><th>Switch par asar</th></tr>
<tr><td>Access type</td><td>ACCESS_ACCEPT ya ACCESS_REJECT</td><td>Session permit ya deny</td></tr>
<tr><td>VLAN</td><td>Tunnel-Type (64) = VLAN, Tunnel-Medium-Type (65) = 802, Tunnel-Private-Group-ID (81) = 20</td><td>Port VLAN 20 mein (ID ya naam se)</td></tr>
<tr><td>Downloadable ACL (dACL)</td><td>cisco-av-pair ACS:CiscoSecure-Defined-ACL = dACL ka naam</td><td>Switch ISE se ACL body download karke us session par apply karta hai</td></tr>
<tr><td>Filter-ID</td><td>Filter-Id (11) = STAFF-ACL.in</td><td>Switch par pehle se maujood ACL apply karta hai</td></tr>
<tr><td>Web redirection</td><td>cisco-av-pair url-redirect aur url-redirect-acl</td><td>Web traffic ko ISE portal par bhejta hai (guest, posture, BYOD)</td></tr>
<tr><td>Security group</td><td>cisco-av-pair cts:security-group-tag = 0028-00</td><td>Session ko SGT 40 (0x28) deta hai (chapter 8)</td></tr>
<tr><td>Voice domain</td><td>cisco-av-pair device-traffic-class = voice</td><td>Multi-domain port par IP phone ko voice VLAN mein daalta hai</td></tr>
<tr><td>Reauthentication</td><td>Session-Timeout (27) aur Termination-Action (29)</td><td>Session khoye bina periodic re-authentication karwata hai</td></tr>
</table>
<p>Wireless ke liye <b>Airespace ACL Name</b> WLC par defined ACL ko refer karta hai, aur VLAN aksar interface naam ki tarah bheja jaata hai. Built-in profiles <b>PermitAccess</b> aur <b>DenyAccess</b> hain; Cisco_WebAuth ek ready-made redirect profile hai.</p>

<h3>VLAN assignment</h3>
<p>VLAN assignment mota par simple hai: alag VLANs ka matlab alag subnets, isliye firewalls aur routers groups ko alag treat kar sakte hain. Iski kamzori yeh hai ki endpoint ko naye VLAN mein IP lena padta hai; agar DHCP ke baad VLAN badle, to endpoint renew hone tak galat address rakhta hai. Isi liye CoA se VLAN change aksar <b>port bounce</b> use karta hai (chapter 10).</p>

<h3>Downloadable ACLs</h3>
<p>dACL ISE mein ek baar define hota hai (Policy &gt; Policy Elements &gt; Results &gt; Authorization &gt; Downloadable ACLs) aur demand par kisi bhi switch par push hota hai. Switch Access-Accept mein ACL ka naam paata hai, uska content laane ke liye doosri RADIUS request bhejta hai, aur use per session apply karta hai. Kyunki dACL source mein <code>any</code> ke saath likha jaata hai, switch <code>any</code> ko endpoint ke IP se replace karta hai, jo woh <b>device tracking</b> (pehle IP device tracking) se seekhta hai. Device tracking ke bina kai platforms par dACLs fail hote hain.</p>

<pre class="code"><span class="c">! ISE mein dACL body: STAFF_DACL</span>
permit udp any any eq 67
permit udp any any eq 53
permit tcp any host 10.20.30.40 eq 443
deny ip any 10.99.99.0 0.0.0.255
permit ip any any

<span class="c">! switch par: dACL source substitution ke liye endpoint IPs seekho</span>
device-tracking policy NK-DT
 tracking enable
interface range g0/1 - 3
 device-tracking attach-policy NK-DT</pre>

<pre class="out">ACC-SW1# show access-session interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0201
         IPv4 Address:  10.20.20.10
            User-Name:  priya
               Status:  Authorized
Server Policies:
           Vlan Group:  Vlan: 20
<span class="hl">              ACS ACL:  xACSACLx-IP-STAFF_DACL-61a7b3c2</span>

ACC-SW1# show ip access-lists xACSACLx-IP-STAFF_DACL-61a7b3c2
Extended IP access list xACSACLx-IP-STAFF_DACL-61a7b3c2 (per-user)
    1 permit udp any any eq bootps
    2 permit udp any any eq domain
    3 permit tcp any host 10.20.30.40 eq 443
<span class="hl">    4 deny ip any 10.99.99.0 0.0.0.255</span>
    5 permit ip any any</pre>

<h3>Redirect profiles</h3>
<p>Redirect profile do cheezein lautata hai: <b>url-redirect</b> (PSN par ISE portal, default port 8443) aur <b>url-redirect-acl</b>, switch par ek ACL ka naam. Us redirect ACL mein <b>permit</b> ka matlab "is traffic ko redirect karo" aur <b>deny</b> ka matlab "redirect mat karo" (DNS, DHCP aur ISE tak ka traffic jaane do). Web sessions intercept karne ke liye switch ko apna web server bhi enable karna padta hai (<code>ip h&#116;tp server</code> aur <code>ip h&#116;tp secure-server</code>). Central WebAuth, posture provisioning aur BYOD onboarding redirect se hi shuru hote hain.</p>

<h3>Reauthentication timers</h3>
<p>Port par <code>authentication periodic</code> aur <code>authentication timer reauthenticate server</code> ke saath switch ISE ka bheja Session-Timeout use karta hai. Supplicant ke liye reauthentication seamless hota hai aur ISE ko policy regularly re-evaluate karne deta hai, jaise staff ke liye har 8 ghante, guests ke liye har 1 ghanta.</p>

<div class="eg"><p><b>Worked example.</b> Contractors ko sirf ticketing web server 10.20.30.40 TCP 443 par, DNS aur DHCP tak pahunchna hai. Option 1: contractor VLAN 30 plus firewall rules, jiske liye har floor par naya subnet chahiye. Option 2: unhe VLAN 20 mein rakho aur dACL CONTRACTOR_DACL (chaar lines) lautao. Option 2 ko koi naya subnet nahi chahiye aur wahi dACL saare 600 switches par chalta hai, kyunki ISE use demand par push karta hai. Switch jo dACL naam dikhata hai uske end mein ek version hash hota hai; jab aap ISE mein dACL edit karte ho, hash badalta hai aur switches agle authentication par naya version download karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> VLAN naam se lautana jab VLAN naam switches mein alag ho (ek par "STAFF", doosre par "Staff"), ya aisa VLAN lautana jo switch par exist hi nahi karta. Session authorization fail hota hai aur switch VLAN assignment error log karta hai. VLAN naam aur IDs consistent rakho, ya numbers use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Redirect ACL mein <b>permit = redirect</b>, deny = redirect mat karo. dACL ISE se download hota hai; Filter-ID ya Airespace ACL switch ya WLC par pehle se hona chahiye. VLAN assignment teen Tunnel attributes 64, 65 aur 81 use karta hai.</p></div>

<div class="scn"><h4>Woh dACL jo kuch block nahi karta tha</h4><p>Ek security audit mein pata chala ki ek switch model par guest sessions internal servers tak pahunch sakte the, jabki ISE ek strict GUEST_DACL lautata tha. Un switches par <code>show access-session</code> ACS ACL dikhata tha, par <code>show ip access-lists</code> mein entries ka source abhi bhi <code>any</code> tha aur zero matches the, aur template change ke baad device tracking disabled tha. Device-tracking policy dobara attach karne se switch guest IPs seekhne aur substitute karne laga, aur hit counters badhne lage.</p><p><b>Seekh:</b> dACL ko endpoint ke IP se bind hone ke liye device tracking chahiye; sirf ACL naam ki maujoodgi nahi, hit counters se verify karo.</p></div>

<div class="iv"><p class="q">"VLAN assignment ki jagah dACL kab use karoge?"</p><p>Strong answer: VLAN assignment subnet badalta hai aur un bade groups ke liye achha hai jinhe downstream devices alag treat karte hain, par har VLAN ke liye addressing aur change par re-DHCP chahiye. dACL endpoint ko uske VLAN mein rakhta hai aur ISE mein centrally defined per-session filtering apply karta hai, jo demand par kisi bhi switch par push hota hai, isliye naye subnets ke bina scale karta hai. Batao ki dACLs ko device tracking chahiye, aur SGTs agla scalable step hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authorization profile Access-Accept mein RADIUS attributes ka bundle hai.</li>
<li>VLAN: Tunnel attributes 64/65/81; baad mein badalne par naye DHCP ke liye aam taur par port bounce chahiye.</li>
<li>dACL: ISE mein defined, per session download, source substitution ke liye device tracking chahiye.</li>
<li>Redirect: url-redirect plus url-redirect-acl, jahan permit ka matlab redirect; switch ka web server enable hona chahiye.</li>
<li>Session-Timeout aur Termination-Action server-driven periodic reauthentication dete hain.</li>
</ul></div>
`}};export{e as default};