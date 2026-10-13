var e={id:`branch-tunnels`,h:{en:`Connecting branches: network tunnel groups and IPsec IKEv2 from IOS XE`,hi:`Branches jodna: network tunnel groups aur IOS XE se IPsec IKEv2`},body:{en:`
<p>A branch office is like a small shop that sends all its parcels to the courier hub in one locked van. The van has the shop's account number painted on the side and a key that only the shop and the hub know. In Secure Access the van is an <b>IPsec IKEv2 tunnel</b>, the account number is the <b>tunnel ID</b>, and the key is the <b>passphrase</b>. Every PC in the branch is protected without installing anything on it.</p>

<h3>Step 1: create the network tunnel group in the console</h3>
<p>Go to <b>Connect, Network Connections, Add</b>. The dialog <b>Add Network Tunnel Group</b> asks for:</p>
<ul>
<li><b>Tunnel group name</b>: BRANCH-DEL. This is the identity that appears in Activity Search.</li>
<li><b>Region / data center</b>: Asia Pacific (Mumbai). <b>Device type</b>: ISR (IOS XE).</li>
<li><b>Tunnel ID</b>: branch-del. Secure Access turns it into a full IKE identity: <code>branch-del@8195126-670467-sse.cisco.com</code>. Copy this exact string.</li>
<li><b>Passphrase</b> and <b>Confirm passphrase</b>: 16 to 64 letters and digits with at least one upper-case letter, one lower-case letter and one digit, for example NwkBranch2026Key.</li>
<li><b>Routing: static IP address prefixes behind the tunnel</b>: 10.10.1.0/24. Secure Access needs this to route return traffic, and later to reach private resources behind a branch. Production sites with many prefixes use <b>BGP</b> over the tunnel instead.</li>
</ul>
<p>After saving, select the group. The details card shows the status, the tunnel ID, the primary head-end <b>146.112.0.10 (IKEv2, UDP 500/4500)</b>, and a <b>Device configuration (IOS XE)</b> template you can adapt.</p>

<h3>Step 2: build the tunnel on the router</h3>
<p>On IOS XE the tunnel is a <b>virtual tunnel interface (VTI)</b>. There are four pieces: a keyring holding the key, an IKEv2 profile holding the identities, an IPsec profile that links to the IKEv2 profile, and the tunnel interface.</p>
<pre class="code"><span class="c">! 1. Keyring: who is the peer and what is the key</span>
crypto ikev2 keyring SSE-KEYRING
 peer SECURE-ACCESS
  address 146.112.0.10
  pre-shared-key NwkBranch2026Key
<span class="c">! 2. IKEv2 profile: match the head-end, send the tunnel ID as our identity</span>
crypto ikev2 profile SSE-IKEV2
 match identity remote address 146.112.0.10 255.255.255.255
 identity local email branch-del@8195126-670467-sse.cisco.com
 authentication remote pre-share
 authentication local pre-share
 keyring local SSE-KEYRING
 dpd 10 2 periodic
<span class="c">! 3. IPsec profile bound to the IKEv2 profile</span>
crypto ipsec profile SSE-IPSEC
 set ikev2-profile SSE-IKEV2
<span class="c">! 4. The VTI</span>
interface Tunnel1
 ip address 169.254.0.1 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4
 tunnel destination 146.112.0.10
 tunnel protection ipsec profile SSE-IPSEC
 no shutdown</pre>
<p>Why <code>identity local email</code>? Thousands of customers terminate tunnels on the same head-end addresses. Secure Access finds <b>your organization and your tunnel group</b> from the IKE identity, then checks the pre-shared key for that group. <code>dpd 10 2 periodic</code> sends dead peer detection every 10 seconds so a dead tunnel is noticed quickly.</p>

<h3>Step 3: verify on both sides</h3>
<pre class="out">BRANCH# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA

Tunnel-id Local                 Remote                fvrf/ivrf            Status
100       <span class="hl">203.0.113.2/4500      146.112.0.10/4500</span>     none/none            <span class="hl">READY</span>
      Encr: AES-GCM, keysize: 256, PRF: SHA256, Hash: None, DH Grp:19, Auth sign: PSK, Auth verify: PSK
      Life/Active Time: 86400/52 sec</pre>
<p>Status <b>READY</b> means IKE is up. Notice <b>port 4500 on both sides</b>. IKE always starts on UDP 500; when NAT traversal is in use the peers move to <b>UDP 4500</b> and ESP is carried inside UDP 4500 so NAT and load-balancing devices can handle it. Secure Access head-ends use NAT traversal, so the established SA shows 4500. That is the answer to the lab question.</p>
<pre class="out">SECURE-ACCESS&gt; show tunnels
BRANCH-DEL        <span class="hl">Connected</span>     branch-del@8195126-670467-sse.cisco.com
    Tunnel established (IKEv2, AES-GCM-256, DH group 19, NAT-T udp/4500)

PC-BR1&gt; curl welcome.sse.example
&lt;h1&gt;<span class="hl">You are protected by Cisco Secure Access</span>&lt;/h1&gt;
&lt;p&gt;Identity: BRANCH-DEL (Network Tunnel Group)&lt;/p&gt;</pre>
<p>The welcome test page is the quickest end-to-end proof: the branch PC's traffic really goes through the tunnel and is identified as BRANCH-DEL.</p>

<h3>Steering traffic into the tunnel</h3>
<p>In production you also decide <b>which traffic</b> enters the tunnel. The usual design keeps a host route to the head-end via the ISP (so the tunnel itself does not try to go through the tunnel) and points the internet default route, or policy-based routing for LAN sources, into Tunnel1. The lab models this steering for the prefixes you enter in the tunnel group. Two more production habits: build a <b>second tunnel to a secondary data center</b> for resilience, and lower the tunnel MTU and clamp TCP MSS (for example <code>ip mtu 1390</code> and <code>ip tcp adjust-mss 1350</code>) to avoid fragmentation. Per-tunnel throughput is limited, so large sites use several tunnels with ECMP.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Branch tunnel">
<rect x="10" y="70" width="100" height="44" rx="8" fill="#bae6fd"/><text x="60" y="90" text-anchor="middle" class="svg-ink" font-size="12">PC-BR1</text><text x="60" y="106" text-anchor="middle" class="svg-muted" font-size="11">10.10.1.10</text>
<rect x="160" y="65" width="120" height="54" rx="8" fill="#fed7aa"/><text x="220" y="87" text-anchor="middle" class="svg-ink" font-size="12">BRANCH</text><text x="220" y="105" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 203.0.113.2</text>
<rect x="330" y="70" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="370" y="96" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<rect x="460" y="60" width="170" height="64" rx="8" fill="#ddd6fe"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="12">Secure Access</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="11">head-end 146.112.0.10</text>
<line x1="110" y1="92" x2="160" y2="92" stroke="#64748b" stroke-width="2"/><line x1="280" y1="92" x2="330" y2="92" stroke="#64748b" stroke-width="2"/><line x1="410" y1="92" x2="460" y2="92" stroke="#64748b" stroke-width="2"/>
<path d="M280 70 Q 370 20 460 70" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="370" y="35" text-anchor="middle" class="svg-accent" font-size="12">Tunnel1: IKEv2, ESP in UDP 4500</text>
<text x="370" y="160" text-anchor="middle" class="svg-muted" font-size="12">IKE identity = tunnel ID, key = passphrase</text>
</svg><p class="cap">The tunnel rides over the ISP. Secure Access recognises the branch from the IKE identity and checks the passphrase.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing only the short prefix <code>branch-del</code> in <code>identity local email</code> instead of the full tunnel ID. Using <code>tunnel mode gre</code> instead of <code>ipsec ipv4</code>. Forgetting <code>set ikev2-profile</code> in the IPsec profile, so the router uses its default identity (its IP address). A passphrase with a trailing space copied from a chat message.</p></div>

<div class="exam"><p><b>Exam traps.</b> Secure Access network tunnels use <b>IKEv2</b> with <b>pre-shared keys</b>, not IKEv1 and not GRE alone. The IKE identity type is e-mail style (the tunnel ID). NAT-T uses <b>UDP 4500</b>; ISAKMP/IKE starts on UDP 500. ESP itself is IP protocol 50 when not encapsulated.</p></div>

<div class="scn"><h4>The tunnel that never came up</h4><p>The Delhi branch was configured from a colleague's notes. The console showed BRANCH-DEL as Disconnected with the details <code>AUTHENTICATION_FAILED: unknown IKE identity branch-delhi@8195126-670467-sse.cisco.com</code>. The engineer compared the identity on the router with the tunnel ID in the group: the router said branch-delhi, the group said branch-del. After correcting <code>identity local email</code> the status turned Connected and <code>show crypto ikev2 sa</code> showed READY on 4500.</p><p><b>Lesson:</b> Secure Access finds your tunnel group from the IKE identity; it must match the tunnel ID character for character.</p></div>

<div class="iv"><p class="q">"Walk me through connecting an ISR branch to Cisco Secure Access."</p><p>Strong answer: create a network tunnel group (name, region, tunnel ID, passphrase, prefixes or BGP); on the router build an IKEv2 keyring with the head-end and passphrase, an IKEv2 profile with <code>identity local email</code> set to the full tunnel ID and pre-share both ways, an IPsec profile with <code>set ikev2-profile</code>, and a VTI with <code>tunnel mode ipsec ipv4</code>; steer internet traffic into the tunnel while keeping a host route to the head-end; verify with <code>show crypto ikev2 sa</code> and the console status. Mention a secondary tunnel, MSS clamping and NAT-T on 4500.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A network tunnel group = name, tunnel ID, passphrase and the prefixes (or BGP) behind it.</li>
<li>IOS XE uses a keyring, an IKEv2 profile, an IPsec profile and a VTI.</li>
<li><code>identity local email</code> must be the full tunnel ID; that is how Secure Access finds your group.</li>
<li>The SA shows UDP 4500 because NAT traversal is used.</li>
<li>Production: second tunnel to another data center, MSS clamping, ECMP for more bandwidth.</li>
</ul></div>
`,hi:`
<p>Branch office ek chhoti dukaan jaisi hai jo apne saare parcels ek locked van mein courier hub bhejti hai. Van par dukaan ka account number paint hai aur ek chaabi hai jo sirf dukaan aur hub jaante hain. Secure Access mein van hai <b>IPsec IKEv2 tunnel</b>, account number hai <b>tunnel ID</b>, aur chaabi hai <b>passphrase</b>. Branch ka har PC bina kuch install kiye protect ho jaata hai.</p>

<h3>Step 1: console mein network tunnel group banao</h3>
<p><b>Connect, Network Connections, Add</b> par jao. <b>Add Network Tunnel Group</b> dialog yeh maangta hai:</p>
<ul>
<li><b>Tunnel group name</b>: BRANCH-DEL. Yahi identity Activity Search mein dikhti hai.</li>
<li><b>Region / data center</b>: Asia Pacific (Mumbai). <b>Device type</b>: ISR (IOS XE).</li>
<li><b>Tunnel ID</b>: branch-del. Secure Access ise poori IKE identity bana deta hai: <code>branch-del@8195126-670467-sse.cisco.com</code>. Yahi exact string copy karo.</li>
<li><b>Passphrase</b> aur <b>Confirm passphrase</b>: 16 se 64 letters aur digits, kam se kam ek upper-case letter, ek lower-case letter aur ek digit ke saath, jaise NwkBranch2026Key.</li>
<li><b>Routing: static IP address prefixes behind the tunnel</b>: 10.10.1.0/24. Secure Access ko return traffic route karne ke liye, aur baad mein branch ke peeche private resources tak pahunchne ke liye, yeh chahiye. Bahut saare prefixes wali production sites tunnel par <b>BGP</b> use karti hain.</li>
</ul>
<p>Save karne ke baad group select karo. Details card status, tunnel ID, primary head-end <b>146.112.0.10 (IKEv2, UDP 500/4500)</b>, aur ek <b>Device configuration (IOS XE)</b> template dikhata hai jise aap adapt kar sakte ho.</p>

<h3>Step 2: router par tunnel banao</h3>
<p>IOS XE par tunnel ek <b>virtual tunnel interface (VTI)</b> hai. Chaar pieces hain: keyring jismein key hai, IKEv2 profile jismein identities hain, IPsec profile jo IKEv2 profile se link karta hai, aur tunnel interface.</p>
<pre class="code"><span class="c">! 1. Keyring: peer kaun hai aur key kya hai</span>
crypto ikev2 keyring SSE-KEYRING
 peer SECURE-ACCESS
  address 146.112.0.10
  pre-shared-key NwkBranch2026Key
<span class="c">! 2. IKEv2 profile: head-end match karo, tunnel ID ko apni identity bhejo</span>
crypto ikev2 profile SSE-IKEV2
 match identity remote address 146.112.0.10 255.255.255.255
 identity local email branch-del@8195126-670467-sse.cisco.com
 authentication remote pre-share
 authentication local pre-share
 keyring local SSE-KEYRING
 dpd 10 2 periodic
<span class="c">! 3. IKEv2 profile se bound IPsec profile</span>
crypto ipsec profile SSE-IPSEC
 set ikev2-profile SSE-IKEV2
<span class="c">! 4. VTI</span>
interface Tunnel1
 ip address 169.254.0.1 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel mode ipsec ipv4
 tunnel destination 146.112.0.10
 tunnel protection ipsec profile SSE-IPSEC
 no shutdown</pre>
<p><code>identity local email</code> kyun? Hazaaron customers same head-end addresses par tunnels terminate karte hain. Secure Access IKE identity se <b>aapki organization aur aapka tunnel group</b> pehchaanta hai, phir us group ki pre-shared key check karta hai. <code>dpd 10 2 periodic</code> har 10 second dead peer detection bhejta hai taaki dead tunnel jaldi pata chale.</p>

<h3>Step 3: dono taraf verify karo</h3>
<pre class="out">BRANCH# show crypto ikev2 sa
 IPv4 Crypto IKEv2  SA

Tunnel-id Local                 Remote                fvrf/ivrf            Status
100       <span class="hl">203.0.113.2/4500      146.112.0.10/4500</span>     none/none            <span class="hl">READY</span>
      Encr: AES-GCM, keysize: 256, PRF: SHA256, Hash: None, DH Grp:19, Auth sign: PSK, Auth verify: PSK
      Life/Active Time: 86400/52 sec</pre>
<p>Status <b>READY</b> ka matlab IKE up hai. Dhyan do <b>dono taraf port 4500</b> hai. IKE hamesha UDP 500 par shuru hota hai; jab NAT traversal use hota hai to peers <b>UDP 4500</b> par shift ho jaate hain aur ESP UDP 4500 ke andar jaata hai taaki NAT aur load-balancing devices use handle kar sakein. Secure Access head-ends NAT traversal use karte hain, isliye established SA 4500 dikhata hai. Lab question ka jawab yahi hai.</p>
<pre class="out">SECURE-ACCESS&gt; show tunnels
BRANCH-DEL        <span class="hl">Connected</span>     branch-del@8195126-670467-sse.cisco.com
    Tunnel established (IKEv2, AES-GCM-256, DH group 19, NAT-T udp/4500)

PC-BR1&gt; curl welcome.sse.example
&lt;h1&gt;<span class="hl">You are protected by Cisco Secure Access</span>&lt;/h1&gt;
&lt;p&gt;Identity: BRANCH-DEL (Network Tunnel Group)&lt;/p&gt;</pre>
<p>Welcome test page sabse jaldi end-to-end proof hai: branch PC ka traffic sach mein tunnel se jaata hai aur BRANCH-DEL ki tarah identify hota hai.</p>

<h3>Traffic ko tunnel mein steer karna</h3>
<p>Production mein aap yeh bhi decide karte ho ki <b>kaunsa traffic</b> tunnel mein jaaye. Usual design head-end ka host route ISP ke through rakhta hai (taaki tunnel khud tunnel ke through jaane ki koshish na kare) aur internet default route, ya LAN sources ke liye policy-based routing, ko Tunnel1 mein point karta hai. Lab yeh steering tunnel group mein diye prefixes ke liye model karti hai. Do aur production habits: resilience ke liye <b>secondary data center tak doosra tunnel</b> banao, aur fragmentation se bachne ke liye tunnel MTU kam karo aur TCP MSS clamp karo (jaise <code>ip mtu 1390</code> aur <code>ip tcp adjust-mss 1350</code>). Per-tunnel throughput limited hota hai, isliye badi sites ECMP ke saath kai tunnels use karti hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Branch tunnel">
<rect x="10" y="70" width="100" height="44" rx="8" fill="#bae6fd"/><text x="60" y="90" text-anchor="middle" class="svg-ink" font-size="12">PC-BR1</text><text x="60" y="106" text-anchor="middle" class="svg-muted" font-size="11">10.10.1.10</text>
<rect x="160" y="65" width="120" height="54" rx="8" fill="#fed7aa"/><text x="220" y="87" text-anchor="middle" class="svg-ink" font-size="12">BRANCH</text><text x="220" y="105" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0 203.0.113.2</text>
<rect x="330" y="70" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="370" y="96" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<rect x="460" y="60" width="170" height="64" rx="8" fill="#ddd6fe"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="12">Secure Access</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="11">head-end 146.112.0.10</text>
<line x1="110" y1="92" x2="160" y2="92" stroke="#64748b" stroke-width="2"/><line x1="280" y1="92" x2="330" y2="92" stroke="#64748b" stroke-width="2"/><line x1="410" y1="92" x2="460" y2="92" stroke="#64748b" stroke-width="2"/>
<path d="M280 70 Q 370 20 460 70" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="370" y="35" text-anchor="middle" class="svg-accent" font-size="12">Tunnel1: IKEv2, UDP 4500 mein ESP</text>
<text x="370" y="160" text-anchor="middle" class="svg-muted" font-size="12">IKE identity = tunnel ID, key = passphrase</text>
</svg><p class="cap">Tunnel ISP ke upar chalta hai. Secure Access branch ko IKE identity se pehchaanta hai aur passphrase check karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>identity local email</code> mein poore tunnel ID ki jagah sirf chhota prefix <code>branch-del</code> type karna. <code>ipsec ipv4</code> ki jagah <code>tunnel mode gre</code> use karna. IPsec profile mein <code>set ikev2-profile</code> bhool jaana, jisse router apni default identity (apna IP address) use karta hai. Chat message se copy kiya passphrase jiske end mein space hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Secure Access network tunnels <b>IKEv2</b> aur <b>pre-shared keys</b> use karte hain, IKEv1 nahi aur akela GRE nahi. IKE identity type e-mail style hai (tunnel ID). NAT-T <b>UDP 4500</b> use karta hai; ISAKMP/IKE UDP 500 par shuru hota hai. ESP khud IP protocol 50 hai jab encapsulated na ho.</p></div>

<div class="scn"><h4>Woh tunnel jo kabhi up nahi hua</h4><p>Delhi branch ek colleague ke notes se configure hui thi. Console ne BRANCH-DEL ko Disconnected dikhaya, details: <code>AUTHENTICATION_FAILED: unknown IKE identity branch-delhi@8195126-670467-sse.cisco.com</code>. Engineer ne router ki identity ko group ke tunnel ID se compare kiya: router par branch-delhi tha, group mein branch-del. <code>identity local email</code> theek karne ke baad status Connected ho gaya aur <code>show crypto ikev2 sa</code> ne 4500 par READY dikhaya.</p><p><b>Seekh:</b> Secure Access aapka tunnel group IKE identity se dhoondhta hai; yeh tunnel ID se har character tak match honi chahiye.</p></div>

<div class="iv"><p class="q">"Mujhe batao ISR branch ko Cisco Secure Access se kaise jodoge."</p><p>Strong answer: network tunnel group banao (name, region, tunnel ID, passphrase, prefixes ya BGP); router par head-end aur passphrase ke saath IKEv2 keyring, <code>identity local email</code> ko poore tunnel ID par set karke aur dono taraf pre-share ke saath IKEv2 profile, <code>set ikev2-profile</code> wala IPsec profile, aur <code>tunnel mode ipsec ipv4</code> wala VTI banao; head-end ka host route rakhte hue internet traffic ko tunnel mein steer karo; <code>show crypto ikev2 sa</code> aur console status se verify karo. Secondary tunnel, MSS clamping aur 4500 par NAT-T bhi mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network tunnel group = name, tunnel ID, passphrase aur uske peeche ke prefixes (ya BGP).</li>
<li>IOS XE keyring, IKEv2 profile, IPsec profile aur VTI use karta hai.</li>
<li><code>identity local email</code> poora tunnel ID hona chahiye; isi se Secure Access aapka group dhoondhta hai.</li>
<li>SA UDP 4500 dikhata hai kyunki NAT traversal use hota hai.</li>
<li>Production: dusre data center tak doosra tunnel, MSS clamping, zyada bandwidth ke liye ECMP.</li>
</ul></div>
`}};export{e as default};