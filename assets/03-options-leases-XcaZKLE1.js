var e={id:`options-leases`,h:{en:`DHCP options, leases, renewal (T1/T2) and APIPA`,hi:`DHCP options, leases, renewal (T1/T2) aur APIPA`},body:{en:`
<p>Back at the hotel: the key card does not just open a door. The welcome envelope also has the Wi-Fi password, breakfast timings and the checkout date. If you want to stay longer, you call reception before checkout; if reception does not answer, you ask any staff member; if nobody extends your stay, you hand the key back. DHCP options are that welcome envelope, and the lease timers are the checkout rules.</p>

<h3>Options: everything beyond the address</h3>
<p>A DHCP message has fixed fields (xid, ciaddr, yiaddr, siaddr, giaddr, chaddr) and then a list of <b>options</b>. Each option is a number, a length and a value. You do not need all 200+ of them, but the CCNA and real jobs expect you to know these:</p>
<table class="cmp"><tr><th>Option</th><th>Name</th><th>What it carries</th><th>IOS pool command</th></tr>
<tr><td>1</td><td>Subnet mask</td><td>255.255.255.0</td><td>from <code>network</code></td></tr>
<tr><td>3</td><td>Router</td><td>Default gateway list</td><td><code>default-router</code></td></tr>
<tr><td>6</td><td>Domain name server</td><td>DNS server list</td><td><code>dns-server</code></td></tr>
<tr><td>15</td><td>Domain name</td><td>DNS suffix, for example nwk.lab</td><td><code>domain-name</code></td></tr>
<tr><td>51</td><td>Lease time</td><td>Seconds the address is valid</td><td><code>lease</code></td></tr>
<tr><td>53</td><td>Message type</td><td>1 Discover … 8 Inform</td><td>automatic</td></tr>
<tr><td>54</td><td>Server identifier</td><td>IP of the server that answered</td><td>automatic</td></tr>
<tr><td>58 / 59</td><td>Renewal (T1) / rebinding (T2)</td><td>When to renew and rebind</td><td>derived from the lease</td></tr>
<tr><td>43</td><td>Vendor specific</td><td>For Cisco lightweight APs: WLC addresses</td><td><code>option 43 hex …</code></td></tr>
<tr><td>66 / 150</td><td>TFTP server name / Cisco TFTP list</td><td>Where IP phones fetch their configuration</td><td><code>option 150 ip …</code></td></tr>
<tr><td>82</td><td>Relay agent information</td><td>Switch and port a request came from</td><td>added by relay/DHCP snooping</td></tr>
</table>
<p>Option <b>15</b> matters more than it looks: with domain <code>nwk.lab</code>, a user who types <code>ping www</code> actually queries <code>www.nwk.lab</code>. Option <b>43</b> is how a new access point finds its wireless controller, which you will use in the WLAN modules. Option <b>150</b> tells Cisco IP phones where their TFTP server is.</p>

<div class="eg"><p><b>Worked example: building option 43.</b> A lightweight AP must learn that the controller is 10.1.100.20. Cisco uses a TLV: type <code>f1</code>, length <code>04</code> per controller (4 bytes), then the address in hex. 10 = 0a, 1 = 01, 100 = 64, 20 = 14, so the value is <code>f1040a016414</code>. With two controllers the length becomes 08 and both addresses follow.</p></div>

<pre class="code"><span class="c">! extra options in a pool (for reference; the CCNA labs use the core four)</span>
ip dhcp pool AP-VLAN
 option 43 hex f104.0a01.6414
 option 150 ip 10.1.100.30</pre>

<h3>The lease lifecycle: T1, T2 and expiry</h3>
<p>A <b>lease</b> is a loan with an end date. Cisco IOS defaults to <b>one day</b>; many Windows servers default to eight days. The client does not wait until the last second; it follows two timers:</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lease timeline with T1 and T2">
<rect x="20" y="60" width="300" height="40" fill="#bbf7d0"/><rect x="320" y="60" width="225" height="40" fill="#fde68a"/><rect x="545" y="60" width="75" height="40" fill="#fed7aa"/>
<text x="170" y="85" text-anchor="middle" class="svg-ink" font-size="13">Bound: use the address</text>
<text x="432" y="85" text-anchor="middle" class="svg-ink" font-size="13">Renewing (unicast)</text>
<text x="582" y="85" text-anchor="middle" class="svg-ink" font-size="12">Rebinding</text>
<line x1="20" y1="50" x2="20" y2="110" stroke="#64748b" stroke-width="2"/><text x="20" y="130" text-anchor="middle" class="svg-muted" font-size="12">0 h</text>
<line x1="320" y1="50" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">T1 = 50% (12 h)</text>
<line x1="545" y1="50" x2="545" y2="110" stroke="#64748b" stroke-width="2"/><text x="545" y="148" text-anchor="middle" class="svg-accent" font-size="12">T2 = 87.5% (21 h)</text>
<line x1="620" y1="50" x2="620" y2="110" stroke="#64748b" stroke-width="2"/><text x="612" y="40" text-anchor="end" class="svg-muted" font-size="12">24 h expiry</text>
</svg><p class="cap">A one-day lease: renew with the same server at 12 h, ask any server from 21 h, stop using the address at 24 h.</p></div>
<ul>
<li><b>T1, the renewal time (default 50% of the lease).</b> The client sends a <b>unicast</b> DHCPREQUEST straight to the server that gave the lease, with its current address in ciaddr. A normal answer is an ACK with a fresh lease. The user notices nothing.</li>
<li><b>T2, the rebinding time (default 87.5%).</b> If the original server has not answered, the client <b>broadcasts</b> a DHCPREQUEST so that <i>any</i> server able to confirm the address can do so.</li>
<li><b>Expiry (100%).</b> If still nobody answers, the client must stop using the address and starts DORA from scratch.</li>
</ul>
<p>This is why a DHCP server outage does not take users down instantly: every client with a valid lease keeps working until its lease runs out. It is also why very short leases (minutes) create load and log noise, and very long leases waste addresses in busy guest networks.</p>

<h3>When nobody answers: APIPA and 169.254.x.x</h3>
<p>If a Windows or macOS client finds no DHCP server at all, it gives itself an <b>APIPA (Automatic Private IP Addressing)</b> address from the IPv4 link-local range <b>169.254.0.0/16</b>, with no gateway. It keeps retrying DHCP in the background. A 169.254 address lets two hosts on the same cable talk, but nothing beyond the subnet works.</p>
<pre class="out">C:\\&gt; ipconfig
Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . :
   <span class="hl">Autoconfiguration IPv4 Address. . : 169.254.37.112</span>
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :</pre>
<p>For a network engineer a 169.254 address is not a "bad IP"; it is a clear message: <b>the DHCP exchange failed</b>. Your job is to find out where: the client's port and VLAN, the relay, the path to the server, or the server's pool.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Setting a lease of <code>0</code> days thinking it means "infinite"; use <code>lease infinite</code>. (2) Forgetting that clients keep old options until renewal: if you change the DNS server in the pool, clients learn it at T1, or immediately after <code>ipconfig /renew</code>. (3) Treating 169.254 as a DHCP option problem; it means no lease at all.</p></div>
<div class="exam"><p><b>Exam trap.</b> T1 renewal is <b>unicast to the original server</b>; T2 rebinding is <b>broadcast</b>. Default IOS lease = 1 day. 169.254.0.0/16 = APIPA, no DHCP server reached. Option 3 = gateway, 6 = DNS, 15 = domain name, 51 = lease, 43 = WLC for lightweight APs, 150 = TFTP for IP phones.</p></div>

<div class="scn"><h4>The DNS change that took a day</h4><p>A team moved the internal DNS server from 10.1.100.52 to 10.1.100.53 on a Monday morning and updated the DHCP pool. By lunch, half the users still could not resolve internal names. <code>ipconfig /all</code> showed the old DNS on those PCs with "Lease Obtained" the previous afternoon. Their one-day leases would pick up the new option only at T1. The engineer kept the old server answering for 24 hours and asked the help desk to run <code>ipconfig /renew</code> on anyone who called.</p><p><b>Lesson:</b> option changes reach clients at renewal. Plan changes around the lease time, or lower the lease a day before.</p></div>

<div class="iv"><p class="q">"What happens when the DHCP server goes down for two hours?"</p><p>Clients with a valid lease keep working. At T1 (50%) they try to renew by unicast with the original server and fail quietly; at T2 (87.5%) they broadcast to any server; only at expiry do they drop the address. So with a one-day lease most users feel nothing from a two-hour outage, but new devices and anyone rebooting get nothing (Windows falls back to 169.254). Suggest redundancy: split scopes or a failover pair.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Core options: 1 mask, 3 gateway, 6 DNS, 15 domain name, 51 lease; also 43 (WLC), 150 (TFTP), 82 (relay info).</li>
<li>T1 at 50%: unicast renew to the original server. T2 at 87.5%: broadcast rebind to any server.</li>
<li>At expiry the client drops the address and restarts DORA. IOS default lease is 1 day.</li>
<li>169.254.x.x (APIPA) means no DHCP server answered at all.</li>
<li>Pool changes reach clients at their next renewal, not instantly.</li>
</ul></div>
`,hi:`
<p>Wapas hotel par chalte hain: key card sirf darwaza nahi kholta. Welcome envelope mein Wi-Fi password, breakfast timings aur checkout date bhi hoti hai. Agar aap zyada rukna chahte ho, checkout se pehle reception ko call karte ho; agar reception jawab na de, kisi bhi staff member se poochte ho; agar koi aapka stay extend na kare, aap key wapas de dete ho. DHCP options woh welcome envelope hain, aur lease timers checkout ke rules.</p>

<h3>Options: address ke alawa sab kuch</h3>
<p>DHCP message mein fixed fields hote hain (xid, ciaddr, yiaddr, siaddr, giaddr, chaddr) aur phir <b>options</b> ki list. Har option ek number, ek length aur ek value hai. Aapko 200+ options sab nahi chahiye, lekin CCNA aur real jobs expect karte hain ki aap yeh jaano:</p>
<table class="cmp"><tr><th>Option</th><th>Naam</th><th>Kya le jaata hai</th><th>IOS pool command</th></tr>
<tr><td>1</td><td>Subnet mask</td><td>255.255.255.0</td><td><code>network</code> se</td></tr>
<tr><td>3</td><td>Router</td><td>Default gateway list</td><td><code>default-router</code></td></tr>
<tr><td>6</td><td>Domain name server</td><td>DNS server list</td><td><code>dns-server</code></td></tr>
<tr><td>15</td><td>Domain name</td><td>DNS suffix, jaise nwk.lab</td><td><code>domain-name</code></td></tr>
<tr><td>51</td><td>Lease time</td><td>Address kitne seconds valid hai</td><td><code>lease</code></td></tr>
<tr><td>53</td><td>Message type</td><td>1 Discover … 8 Inform</td><td>automatic</td></tr>
<tr><td>54</td><td>Server identifier</td><td>Jawab dene wale server ka IP</td><td>automatic</td></tr>
<tr><td>58 / 59</td><td>Renewal (T1) / rebinding (T2)</td><td>Kab renew aur kab rebind karna hai</td><td>lease se nikalta hai</td></tr>
<tr><td>43</td><td>Vendor specific</td><td>Cisco lightweight APs ke liye: WLC addresses</td><td><code>option 43 hex …</code></td></tr>
<tr><td>66 / 150</td><td>TFTP server name / Cisco TFTP list</td><td>IP phones apni configuration kahan se laayein</td><td><code>option 150 ip …</code></td></tr>
<tr><td>82</td><td>Relay agent information</td><td>Request kis switch aur port se aayi</td><td>relay/DHCP snooping add karta hai</td></tr>
</table>
<p>Option <b>15</b> jitna dikhta hai usse zyada matter karta hai: domain <code>nwk.lab</code> ke saath, jo user <code>ping www</code> type karta hai woh asal mein <code>www.nwk.lab</code> query karta hai. Option <b>43</b> se naya access point apna wireless controller dhoondhta hai, jo aap WLAN modules mein use karoge. Option <b>150</b> Cisco IP phones ko batata hai ki unka TFTP server kahan hai.</p>

<div class="eg"><p><b>Worked example: option 43 banana.</b> Lightweight AP ko seekhna hai ki controller 10.1.100.20 hai. Cisco ek TLV use karta hai: type <code>f1</code>, har controller ke liye length <code>04</code> (4 bytes), phir address hex mein. 10 = 0a, 1 = 01, 100 = 64, 20 = 14, to value <code>f1040a016414</code> hai. Do controllers ke saath length 08 ho jaati hai aur dono addresses aage aate hain.</p></div>

<pre class="code"><span class="c">! pool mein extra options (reference ke liye; CCNA labs core chaar use karte hain)</span>
ip dhcp pool AP-VLAN
 option 43 hex f104.0a01.6414
 option 150 ip 10.1.100.30</pre>

<h3>Lease lifecycle: T1, T2 aur expiry</h3>
<p><b>Lease</b> ek end date wala loan hai. Cisco IOS ka default <b>ek din</b> hai; bahut se Windows servers ka default aath din. Client aakhri second tak wait nahi karta; woh do timers follow karta hai:</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="T1 aur T2 ke saath lease timeline">
<rect x="20" y="60" width="300" height="40" fill="#bbf7d0"/><rect x="320" y="60" width="225" height="40" fill="#fde68a"/><rect x="545" y="60" width="75" height="40" fill="#fed7aa"/>
<text x="170" y="85" text-anchor="middle" class="svg-ink" font-size="13">Bound: address use karo</text>
<text x="432" y="85" text-anchor="middle" class="svg-ink" font-size="13">Renewing (unicast)</text>
<text x="582" y="85" text-anchor="middle" class="svg-ink" font-size="12">Rebinding</text>
<line x1="20" y1="50" x2="20" y2="110" stroke="#64748b" stroke-width="2"/><text x="20" y="130" text-anchor="middle" class="svg-muted" font-size="12">0 h</text>
<line x1="320" y1="50" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">T1 = 50% (12 h)</text>
<line x1="545" y1="50" x2="545" y2="110" stroke="#64748b" stroke-width="2"/><text x="545" y="148" text-anchor="middle" class="svg-accent" font-size="12">T2 = 87.5% (21 h)</text>
<line x1="620" y1="50" x2="620" y2="110" stroke="#64748b" stroke-width="2"/><text x="612" y="40" text-anchor="end" class="svg-muted" font-size="12">24 h expiry</text>
</svg><p class="cap">Ek din ki lease: 12 h par same server se renew, 21 h se kisi bhi server se poocho, 24 h par address use karna band.</p></div>
<ul>
<li><b>T1, renewal time (default lease ka 50%).</b> Client lease dene wale server ko seedha <b>unicast</b> DHCPREQUEST bhejta hai, ciaddr mein apna current address daal kar. Normal jawab fresh lease wala ACK hai. User ko kuch pata nahi chalta.</li>
<li><b>T2, rebinding time (default 87.5%).</b> Agar original server ne jawab nahi diya, client DHCPREQUEST <b>broadcast</b> karta hai taaki <i>koi bhi</i> server jo address confirm kar sake, kar de.</li>
<li><b>Expiry (100%).</b> Agar ab bhi koi jawab na de, client ko address use karna band karna padta hai aur woh DORA shuru se karta hai.</li>
</ul>
<p>Isiliye DHCP server outage users ko turant down nahi karta: valid lease wala har client lease khatam hone tak kaam karta rehta hai. Isiliye bahut chhoti leases (minutes) load aur log noise banati hain, aur bahut lambi leases busy guest networks mein addresses waste karti hain.</p>

<h3>Jab koi jawab na de: APIPA aur 169.254.x.x</h3>
<p>Agar Windows ya macOS client ko koi DHCP server nahi milta, woh khud ko IPv4 link-local range <b>169.254.0.0/16</b> se ek <b>APIPA (Automatic Private IP Addressing)</b> address de deta hai, bina gateway ke. Woh background mein DHCP retry karta rehta hai. 169.254 address same cable par do hosts ko baat karne deta hai, lekin subnet ke bahar kuch nahi chalta.</p>
<pre class="out">C:\\&gt; ipconfig
Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . :
   <span class="hl">Autoconfiguration IPv4 Address. . : 169.254.37.112</span>
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :</pre>
<p>Network engineer ke liye 169.254 address "kharab IP" nahi hai; yeh ek saaf message hai: <b>DHCP exchange fail hua</b>. Aapka kaam hai pata lagana kahan: client ka port aur VLAN, relay, server tak ka path, ya server ka pool.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>0</code> din ki lease set karna yeh soch kar ki iska matlab "infinite" hai; <code>lease infinite</code> use karo. (2) Bhool jaana ki clients renewal tak purane options rakhte hain: agar aap pool mein DNS server badalte ho, clients use T1 par seekhte hain, ya <code>ipconfig /renew</code> ke turant baad. (3) 169.254 ko DHCP option problem samajhna; iska matlab hai koi lease hi nahi mili.</p></div>
<div class="exam"><p><b>Exam trap.</b> T1 renewal <b>original server ko unicast</b> hai; T2 rebinding <b>broadcast</b> hai. Default IOS lease = 1 din. 169.254.0.0/16 = APIPA, koi DHCP server nahi mila. Option 3 = gateway, 6 = DNS, 15 = domain name, 51 = lease, 43 = lightweight APs ke liye WLC, 150 = IP phones ke liye TFTP.</p></div>

<div class="scn"><h4>DNS change jisme ek din laga</h4><p>Ek team ne Monday subah internal DNS server 10.1.100.52 se 10.1.100.53 par shift kiya aur DHCP pool update kiya. Lunch tak aadhe users abhi bhi internal names resolve nahi kar paa rahe the. Un PCs par <code>ipconfig /all</code> ne purana DNS dikhaya aur "Lease Obtained" pichhli dopahar ka. Unki ek din ki leases naya option sirf T1 par uthati. Engineer ne purane server ko 24 ghante jawab dete rehne diya aur help desk ko kaha ki jo bhi call kare uska <code>ipconfig /renew</code> chalwayein.</p><p><b>Seekh:</b> option changes clients tak renewal par pahunchte hain. Changes lease time ke hisaab se plan karo, ya ek din pehle lease kam kar do.</p></div>

<div class="iv"><p class="q">"Jab DHCP server do ghante ke liye down ho jaaye to kya hota hai?"</p><p>Valid lease wale clients kaam karte rehte hain. T1 (50%) par woh original server se unicast se renew try karte hain aur chupchaap fail hote hain; T2 (87.5%) par kisi bhi server ko broadcast karte hain; sirf expiry par address chhodte hain. To ek din ki lease ke saath zyada tar users ko do ghante ke outage ka pata bhi nahi chalta, lekin naye devices aur reboot karne wale kisi ko kuch nahi milta (Windows 169.254 par chala jaata hai). Redundancy suggest karo: split scopes ya failover pair.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Core options: 1 mask, 3 gateway, 6 DNS, 15 domain name, 51 lease; saath mein 43 (WLC), 150 (TFTP), 82 (relay info).</li>
<li>50% par T1: original server ko unicast renew. 87.5% par T2: kisi bhi server ko broadcast rebind.</li>
<li>Expiry par client address chhodta hai aur DORA dobara shuru karta hai. IOS default lease 1 din hai.</li>
<li>169.254.x.x (APIPA) ka matlab hai kisi DHCP server ne jawab hi nahi diya.</li>
<li>Pool changes clients tak unke agle renewal par pahunchte hain, turant nahi.</li>
</ul></div>
`}};export{e as default};