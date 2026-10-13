var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from AP join to the wrong VLAN`,hi:`Troubleshooting workflow: AP join se galat VLAN tak`},body:{en:`
<p>A good doctor does not start with surgery. She asks where it hurts, checks pulse and temperature, then orders the right test. Wireless tickets deserve the same discipline. "The Wi-Fi is broken" can mean the AP is not joined, the WLAN is disabled, the key is wrong, the client is in the wrong VLAN, or the router is filtering. Checking in a fixed order, from the AP up to the router, finds the fault quickly and stops you from changing things at random.</p>

<h3>Step 1: define the symptom and its scope</h3>
<p>One client or everyone? One SSID or all? One AP or the whole floor? "Nobody sees any SSID" points to APs or radios. "Everyone sees the SSID but nobody connects" points to security. "Connected, but no IP" or "connected, wrong IP" points to the interface, VLAN or DHCP. "Connected, right IP, but reaching things it should not" points to VLAN mapping and ACLs.</p>

<h3>Step 2: the ladder of checks</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Wireless troubleshooting ladder">
<rect x="40" y="10" width="560" height="40" rx="8" fill="#fed7aa"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. AP joined?  show ap summary, AP: show capwap</text>
<rect x="40" y="60" width="560" height="40" rx="8" fill="#fde68a"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">2. WLAN on air?  show wlan summary, show wlan N (enabled, broadcast)</text>
<rect x="40" y="110" width="560" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">3. Client authenticated?  show client summary, show msglog, RADIUS</text>
<rect x="40" y="160" width="560" height="40" rx="8" fill="#bae6fd"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">4. Right interface and VLAN?  show wlan N, show interface summary</text>
<rect x="40" y="210" width="560" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="13">5. Wired side?  SW: show vlan brief / trunk; R1: DHCP pool, ACL</text>
<text x="320" y="272" text-anchor="middle" class="svg-muted" font-size="12">climb one rung at a time; fix the lowest broken rung first</text>
</svg><p class="cap">Five rungs from radio to router. Most tickets are solved on rung 2 or rung 4.</p></div>

<table class="cmp"><tr><th>Rung</th><th>Command</th><th>What to look for</th></tr>
<tr><td>1 AP</td><td><code>show ap summary</code>, <code>show capwap</code> (AP)</td><td>AP listed, mode Local, CAPWAP state RUN</td></tr>
<tr><td>2 WLAN</td><td><code>show wlan summary</code>, <code>show wlan 3</code></td><td>Status Enabled, Broadcast SSID Enabled, expected security</td></tr>
<tr><td>3 Client</td><td><code>show client summary</code>, <code>show client detail &lt;mac&gt;</code>, <code>show msglog</code>, <code>show radius summary</code></td><td>Associated, correct WLAN, auth failures, RADIUS timeouts</td></tr>
<tr><td>4 Mapping</td><td><code>show wlan 3</code> (Interface), <code>show interface summary</code></td><td>WLAN on the intended interface; interface on the intended VLAN</td></tr>
<tr><td>5 Wired</td><td><code>show vlan brief</code>, <code>show interfaces trunk</code>, <code>show ip dhcp binding</code>, <code>show access-lists</code></td><td>VLAN exists and is allowed, pool hands out addresses, ACL hits</td></tr>
</table>

<h3>Walkthrough: the lab "Guest clients on the wrong VLAN"</h3>
<p><b>Ticket.</b> Security audit: "A visitor phone on NK-GUEST can open the internal file server SRV1 (10.10.50.10)." Visitors also say NK-GUEST is not in their Wi-Fi list. Guests must land in VLAN 30 (10.10.30.0/24), where R1 allows only the internet (INET 203.0.113.10). NK-STAFF must keep working.</p>
<p><b>Rung 1 and 2.</b> APs are joined (PHONE1 is connected, after all). Look at the WLANs:</p>
<pre class="out">(WLC1) &gt;show wlan summary

Number of WLANs.................................. 2

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
1        STAFF / NK-STAFF                  Enabled   staff             WPA2-Personal (PSK)
<span class="hl">3        GUEST / NK-GUEST                  Enabled   staff             Open</span>

(WLC1) &gt;show wlan 3

WLAN Identifier.................................. 3
Profile Name..................................... GUEST
Network Name (SSID).............................. NK-GUEST
Status........................................... Enabled
<span class="hl">Broadcast SSID................................... Disabled</span>
Number of Active Clients......................... 1
<span class="hl">Interface........................................ staff</span></pre>
<p>Two findings. Broadcast is disabled, which explains the missing SSID; PHONE1 only connected because it had a saved profile. And the guest WLAN is mapped to <b>staff</b>. Confirm on the client:</p>
<pre class="out">PHONE1&gt; wifi status
SSID        : NK-GUEST
AP          : AP2
Security    : Open
<span class="hl">IP address  : 10.10.20.22/24 (DHCP)</span></pre>
<p>PHONE1 is in the staff subnet, so ACL GUEST-IN on R1 Gi0/0.30 never sees its packets. That is the audit finding.</p>
<p><b>Rung 4.</b> Before remapping, check the guest interface itself:</p>
<pre class="out">(WLC1) &gt;show interface summary

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
management            1     99        10.10.99.10      Static   Yes     No
staff                 1     20        10.10.20.5       Dynamic  No      No
<span class="hl">guest                 1     31        10.10.30.5       Dynamic  No      No</span>
virtual               N/A   N/A       192.0.2.1        Static   No      No</pre>
<p><b>Rung 5.</b> The guest interface is tagged VLAN 31. Does the switch carry 31?</p>
<pre class="out">SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
10   AP-MGMT                          active    Gi0/2, Gi0/3
20   STAFF                            active
<span class="hl">30   GUEST                            active</span>
40   CORP                             active
99   WLC-MGMT                         active</pre>
<p>No VLAN 31. Had we only remapped the WLAN to <code>guest</code>, phones would have been sent into a VLAN that goes nowhere and received no address. The correct fix touches three things, in this order:</p>
<pre class="code">(WLC1) &gt;config wlan broadcast-ssid enable 3
(WLC1) &gt;config interface vlan guest 30
(WLC1) &gt;config wlan interface 3 guest
(WLC1) &gt;save config</pre>
<p>GUI equivalent: WLANs &gt; NK-GUEST &gt; General (Broadcast SSID, Interface = guest), and Controller &gt; Interfaces &gt; guest (VLAN Identifier 30). When the WLAN's interface changes, the WLC de-authenticates its clients; PHONE1 re-joins and runs DHCP again.</p>

<h3>Verify and close</h3>
<pre class="out">PHONE1&gt; wifi status
SSID        : NK-GUEST
<span class="hl">IP address  : 10.10.30.22/24 (DHCP)</span>
PHONE1&gt; ping 203.0.113.10
84 bytes from 203.0.113.10 icmp_seq=1 ttl=63 time=0.771 ms
PHONE1&gt; ping 10.10.50.10
<span class="hl">*10.10.30.1 icmp_seq=1 ttl=255 time=1.012 ms (ICMP type:3, code:13, Communication administratively prohibited)</span>
LAPTOP1&gt; ping 10.10.50.10
84 bytes from 10.10.50.10 icmp_seq=1 ttl=63 time=0.918 ms</pre>
<p>Guests reach the internet, the ACL blocks the file server, staff still reach it. Audit closed.</p>

<div class="eg"><p><b>Worked example: reading symptoms to rungs.</b> "SSID visible, laptop says wrong password, msglog shows AUTH_FAIL for that MAC" = rung 3, key mismatch. "Connected, IP 169.254.x.x" = rung 4 or 5: interface VLAN not on the switch, not allowed on the trunk, or no DHCP pool. "No AP in show ap summary" = rung 1: go back to the join checklist in chapter 4. "RADIUS requests and timeouts rising together" = rung 3, shared secret or client IP on the server.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing only the first fault you find (remapping the WLAN but not the VLAN) and declaring victory. Changing security to "fix" a DHCP problem. Testing from a staff laptop instead of a guest device. Forgetting to re-test the working WLAN after the change.</p></div>

<div class="exam"><p><b>Exam trap.</b> A client that <b>associates but gets no IP</b> is not a radio or security problem: look at the interface/VLAN mapping, the trunk and DHCP. A client in the <b>wrong subnet</b> means the WLAN is mapped to the wrong interface (or AAA override assigned another VLAN). A hidden SSID only hides the name; it never stops a device with a saved profile.</p></div>

<div class="scn"><h4>The 169.254 morning</h4><p>After a weekend change, every client on NK-CORP connected with 802.1X successfully but received a 169.254 address. The WLC showed the clients associated and authenticated on WLAN 2. Rung 4: <code>show wlan 2</code> said interface <code>corp</code>, and <code>show interface summary</code> showed corp in VLAN 40. Rung 5: on the switch, <code>show interfaces trunk</code> for the WLC port listed allowed VLANs 20,30,99; the weekend change had replaced the allowed list with <code>switchport trunk allowed vlan 20,30,99</code> instead of using <code>add</code>. Adding VLAN 40 back restored DHCP instantly.</p><p><b>Lesson:</b> authentication success followed by no IP is a wired-side problem. Climb the ladder instead of touching security.</p></div>

<div class="iv"><p class="q">"Users on the guest SSID can reach internal servers. How do you troubleshoot it?"</p><p>Strong answer: check a guest client's IP first; if it is in a staff or corporate subnet, the WLAN is mapped to the wrong interface (show wlan N) or AAA override is assigning a VLAN. Then confirm the guest interface's VLAN (show interface summary) exists on the switch and trunk, and that the gateway has the guest ACL applied inbound. Fix the mapping, let clients re-join, and verify from a guest device that the internet works and internal hosts are blocked, while staff WLANs still work.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope first: one client or all, one SSID or all, one AP or all.</li>
<li>Climb the ladder: AP join, WLAN on air, client auth, interface/VLAN mapping, wired side.</li>
<li>Wrong subnet = wrong WLAN-to-interface mapping; no IP = VLAN, trunk or DHCP problem.</li>
<li>In the guest lab, three faults: broadcast disabled, WLAN on staff, guest interface on VLAN 31.</li>
<li>Verify from the affected client and re-test the WLANs that were working.</li>
</ul></div>
`,hi:`
<p>Ek achhi doctor surgery se shuru nahi karti. Woh poochti hai kahan dard hai, pulse aur temperature check karti hai, phir sahi test karwati hai. Wireless tickets ko bhi yahi discipline chahiye. "Wi-Fi kharab hai" ka matlab ho sakta hai AP join nahi hai, WLAN disabled hai, key galat hai, client galat VLAN mein hai, ya router filter kar raha hai. Ek fixed order mein check karna, AP se router tak, fault jaldi dhoondhta hai aur aapko random cheezein badalne se rokta hai.</p>

<h3>Step 1: symptom aur uska scope define karo</h3>
<p>Ek client ya sab? Ek SSID ya saare? Ek AP ya poora floor? "Kisi ko koi SSID nahi dikhta" APs ya radios ki taraf ishara karta hai. "Sabko SSID dikhta hai par koi connect nahi hota" security ki taraf. "Connected, par IP nahi" ya "connected, galat IP" interface, VLAN ya DHCP ki taraf. "Connected, sahi IP, par un cheezon tak pahunch raha hai jahan nahi pahunchna chahiye" VLAN mapping aur ACLs ki taraf.</p>

<h3>Step 2: checks ki seedhi</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Wireless troubleshooting ki seedhi">
<rect x="40" y="10" width="560" height="40" rx="8" fill="#fed7aa"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. AP joined?  show ap summary, AP: show capwap</text>
<rect x="40" y="60" width="560" height="40" rx="8" fill="#fde68a"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">2. WLAN hawa mein?  show wlan summary, show wlan N (enabled, broadcast)</text>
<rect x="40" y="110" width="560" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">3. Client authenticated?  show client summary, show msglog, RADIUS</text>
<rect x="40" y="160" width="560" height="40" rx="8" fill="#bae6fd"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">4. Sahi interface aur VLAN?  show wlan N, show interface summary</text>
<rect x="40" y="210" width="560" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="13">5. Wired side?  SW: show vlan brief / trunk; R1: DHCP pool, ACL</text>
<text x="320" y="272" text-anchor="middle" class="svg-muted" font-size="12">ek ek seedhi chadho; sabse neeche wali tooti seedhi pehle theek karo</text>
</svg><p class="cap">Radio se router tak paanch seedhiyan. Zyada tar tickets seedhi 2 ya seedhi 4 par solve hote hain.</p></div>

<table class="cmp"><tr><th>Seedhi</th><th>Command</th><th>Kya dekhna hai</th></tr>
<tr><td>1 AP</td><td><code>show ap summary</code>, <code>show capwap</code> (AP)</td><td>AP listed, mode Local, CAPWAP state RUN</td></tr>
<tr><td>2 WLAN</td><td><code>show wlan summary</code>, <code>show wlan 3</code></td><td>Status Enabled, Broadcast SSID Enabled, expected security</td></tr>
<tr><td>3 Client</td><td><code>show client summary</code>, <code>show client detail &lt;mac&gt;</code>, <code>show msglog</code>, <code>show radius summary</code></td><td>Associated, sahi WLAN, auth failures, RADIUS timeouts</td></tr>
<tr><td>4 Mapping</td><td><code>show wlan 3</code> (Interface), <code>show interface summary</code></td><td>WLAN intended interface par; interface intended VLAN par</td></tr>
<tr><td>5 Wired</td><td><code>show vlan brief</code>, <code>show interfaces trunk</code>, <code>show ip dhcp binding</code>, <code>show access-lists</code></td><td>VLAN exist karta hai aur allowed hai, pool addresses deta hai, ACL hits</td></tr>
</table>

<h3>Walkthrough: lab "Guest clients on the wrong VLAN"</h3>
<p><b>Ticket.</b> Security audit: "NK-GUEST par ek visitor phone internal file server SRV1 (10.10.50.10) khol sakta hai." Visitors yeh bhi kehte hain ki NK-GUEST unki Wi-Fi list mein nahi hai. Guests ko VLAN 30 (10.10.30.0/24) mein aana chahiye, jahan R1 sirf internet (INET 203.0.113.10) allow karta hai. NK-STAFF chalta rehna chahiye.</p>
<p><b>Seedhi 1 aur 2.</b> APs joined hain (aakhir PHONE1 connected hai). WLANs dekho:</p>
<pre class="out">(WLC1) &gt;show wlan summary

Number of WLANs.................................. 2

WLAN ID  WLAN Profile Name / SSID          Status    Interface Name    Security
-------  --------------------------------  --------  ----------------  --------------------
1        STAFF / NK-STAFF                  Enabled   staff             WPA2-Personal (PSK)
<span class="hl">3        GUEST / NK-GUEST                  Enabled   staff             Open</span>

(WLC1) &gt;show wlan 3

WLAN Identifier.................................. 3
Profile Name..................................... GUEST
Network Name (SSID).............................. NK-GUEST
Status........................................... Enabled
<span class="hl">Broadcast SSID................................... Disabled</span>
Number of Active Clients......................... 1
<span class="hl">Interface........................................ staff</span></pre>
<p>Do findings. Broadcast disabled hai, jo gayab SSID samjhata hai; PHONE1 sirf isliye connected tha kyunki uska saved profile tha. Aur guest WLAN <b>staff</b> se mapped hai. Client par confirm karo:</p>
<pre class="out">PHONE1&gt; wifi status
SSID        : NK-GUEST
AP          : AP2
Security    : Open
<span class="hl">IP address  : 10.10.20.22/24 (DHCP)</span></pre>
<p>PHONE1 staff subnet mein hai, isliye R1 Gi0/0.30 par ACL GUEST-IN uske packets kabhi dekhta hi nahi. Yahi audit finding hai.</p>
<p><b>Seedhi 4.</b> Remap karne se pehle guest interface khud check karo:</p>
<pre class="out">(WLC1) &gt;show interface summary

Interface Name        Port  Vlan Id   IP Address       Type     Ap Mgr  Guest
--------------------  ----  --------  ---------------  -------  ------  -----
management            1     99        10.10.99.10      Static   Yes     No
staff                 1     20        10.10.20.5       Dynamic  No      No
<span class="hl">guest                 1     31        10.10.30.5       Dynamic  No      No</span>
virtual               N/A   N/A       192.0.2.1        Static   No      No</pre>
<p><b>Seedhi 5.</b> Guest interface VLAN 31 tagged hai. Kya switch 31 carry karta hai?</p>
<pre class="out">SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
10   AP-MGMT                          active    Gi0/2, Gi0/3
20   STAFF                            active
<span class="hl">30   GUEST                            active</span>
40   CORP                             active
99   WLC-MGMT                         active</pre>
<p>VLAN 31 nahi hai. Agar hum sirf WLAN ko <code>guest</code> par remap karte, phones aise VLAN mein bheje jaate jo kahin nahi jaata aur unhe koi address nahi milta. Sahi fix teen cheezein chhoota hai, isi order mein:</p>
<pre class="code">(WLC1) &gt;config wlan broadcast-ssid enable 3
(WLC1) &gt;config interface vlan guest 30
(WLC1) &gt;config wlan interface 3 guest
(WLC1) &gt;save config</pre>
<p>GUI equivalent: WLANs &gt; NK-GUEST &gt; General (Broadcast SSID, Interface = guest), aur Controller &gt; Interfaces &gt; guest (VLAN Identifier 30). Jab WLAN ka interface badalta hai, WLC uske clients ko de-authenticate karta hai; PHONE1 dobara join karta hai aur phir se DHCP chalata hai.</p>

<h3>Verify karo aur band karo</h3>
<pre class="out">PHONE1&gt; wifi status
SSID        : NK-GUEST
<span class="hl">IP address  : 10.10.30.22/24 (DHCP)</span>
PHONE1&gt; ping 203.0.113.10
84 bytes from 203.0.113.10 icmp_seq=1 ttl=63 time=0.771 ms
PHONE1&gt; ping 10.10.50.10
<span class="hl">*10.10.30.1 icmp_seq=1 ttl=255 time=1.012 ms (ICMP type:3, code:13, Communication administratively prohibited)</span>
LAPTOP1&gt; ping 10.10.50.10
84 bytes from 10.10.50.10 icmp_seq=1 ttl=63 time=0.918 ms</pre>
<p>Guests internet tak pahunchte hain, ACL file server block karta hai, staff abhi bhi wahan pahunchta hai. Audit band.</p>

<div class="eg"><p><b>Worked example: symptoms ko seedhiyon se jodna.</b> "SSID dikhta hai, laptop galat password bolta hai, msglog us MAC ke liye AUTH_FAIL dikhata hai" = seedhi 3, key mismatch. "Connected, IP 169.254.x.x" = seedhi 4 ya 5: interface VLAN switch par nahi, trunk par allowed nahi, ya DHCP pool nahi. "show ap summary mein koi AP nahi" = seedhi 1: chapter 4 ki join checklist par wapas jaao. "RADIUS requests aur timeouts saath badh rahe" = seedhi 3, server par shared secret ya client IP.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf pehla mila fault fix karna (WLAN remap karna par VLAN nahi) aur jeet declare kar dena. DHCP problem "fix" karne ke liye security badalna. Guest device ki jagah staff laptop se test karna. Change ke baad chalte hue WLAN ko dobara test karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jo client <b>associate hota hai par IP nahi paata</b> woh radio ya security problem nahi hai: interface/VLAN mapping, trunk aur DHCP dekho. <b>Galat subnet</b> wala client matlab WLAN galat interface se mapped hai (ya AAA override ne doosra VLAN assign kiya). Hidden SSID sirf naam chhupata hai; saved profile wale device ko kabhi nahi rokta.</p></div>

<div class="scn"><h4>169.254 wali subah</h4><p>Weekend change ke baad NK-CORP ka har client 802.1X se successfully connect hua lekin 169.254 address paaya. WLC ne clients ko WLAN 2 par associated aur authenticated dikhaya. Seedhi 4: <code>show wlan 2</code> ne interface <code>corp</code> bola, aur <code>show interface summary</code> ne corp ko VLAN 40 mein dikhaya. Seedhi 5: switch par WLC port ke liye <code>show interfaces trunk</code> ne allowed VLANs 20,30,99 list kiye; weekend change ne <code>add</code> use karne ki jagah allowed list ko <code>switchport trunk allowed vlan 20,30,99</code> se replace kar diya tha. VLAN 40 wapas jodte hi DHCP turant laut aaya.</p><p><b>Seekh:</b> authentication success ke baad IP na milna wired-side problem hai. Security chhoone ki jagah seedhi chadho.</p></div>

<div class="iv"><p class="q">"Guest SSID ke users internal servers tak pahunch sakte hain. Aap ise kaise troubleshoot karoge?"</p><p>Strong answer: pehle guest client ka IP check karo; agar woh staff ya corporate subnet mein hai, WLAN galat interface se mapped hai (show wlan N) ya AAA override VLAN assign kar raha hai. Phir confirm karo ki guest interface ka VLAN (show interface summary) switch aur trunk par exist karta hai, aur gateway par guest ACL inbound laga hai. Mapping fix karo, clients ko dobara join karne do, aur guest device se verify karo ki internet chalta hai aur internal hosts blocked hain, jabki staff WLANs abhi bhi chalte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle scope: ek client ya sab, ek SSID ya sab, ek AP ya sab.</li>
<li>Seedhi chadho: AP join, WLAN hawa mein, client auth, interface/VLAN mapping, wired side.</li>
<li>Galat subnet = galat WLAN-to-interface mapping; IP nahi = VLAN, trunk ya DHCP problem.</li>
<li>Guest lab mein teen faults: broadcast disabled, WLAN staff par, guest interface VLAN 31 par.</li>
<li>Affected client se verify karo aur jo WLANs chal rahe the unhe dobara test karo.</li>
</ul></div>
`}};export{e as default};