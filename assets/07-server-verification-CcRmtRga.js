var e={id:`server-verify`,h:{en:`Verifying the DHCP server: bindings, pools, conflicts and debug`,hi:`DHCP server verify karna: bindings, pools, conflicts aur debug`},body:{en:`
<p>A good hotel manager does not wait for complaints. Every morning they look at the occupancy board: which rooms are taken, how many are free, which ones had a problem last night. On a Cisco DHCP server, four show commands are that board. Learn to read them quickly and most DHCP tickets take minutes, not hours.</p>

<h3>show ip dhcp binding: who has what</h3>
<pre class="out">R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address      Client-ID/              Lease expiration        Type       State      Interface
                Hardware address/
                User name
192.168.10.21   0100.5079.6668.00       Oct 01 2026 09:14 AM    Automatic  Active     GigabitEthernet0/0
192.168.10.22   0100.5079.6668.01       Oct 01 2026 09:15 AM    Automatic  Active     GigabitEthernet0/0
<span class="hl">192.168.20.21   0100.5079.6668.02       Oct 01 2026 09:15 AM    Automatic  Active     Unknown</span>
192.168.20.22   0100.5079.6668.03       Oct 01 2026 09:16 AM    Automatic  Active     Unknown</pre>
<p>Read it column by column. <b>IP address</b> is the leased address. <b>Client-ID</b> is <code>01</code> plus the client MAC (0050.7966.6800 becomes 0100.5079.6668.00). <b>Lease expiration</b> is when the binding ends if not renewed. <b>Type</b> is Automatic (from a pool) or Manual (a reservation). <b>Interface</b> is where the request arrived; <b>Unknown</b> means it came through a relay. Four bindings here means all four lab PCs succeeded, which is exactly what the configuration lab asks you to verify.</p>
<p>To find one user, filter: <code>show ip dhcp binding | include 6668.02</code>. To free an address, <code>clear ip dhcp binding 192.168.20.21</code>, or <code>clear ip dhcp binding *</code> for all (clients keep using their address until they next renew, so warn users first).</p>

<h3>show ip dhcp pool: how full is each pool</h3>
<pre class="out">R1# show ip dhcp pool LAN10

Pool LAN10 :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 <span class="hl">Total addresses                : 254
 Leased addresses               : 2
 Excluded addresses             : 20</span>
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased/Excluded/Total
 192.168.10.23        192.168.10.1     - 192.168.10.254    2     / 20    / 254</pre>
<p>This is the single most useful DHCP command. <b>Total</b> is every usable address in the network, <b>Excluded</b> is how many your global exclusions remove, <b>Leased</b> is how many are in use, and <b>Current index</b> is the next address the server will try. Quick health check: Total minus Excluded minus Leased = addresses still available. Here 254 − 20 − 2 = 232.</p>
<div class="eg"><p><b>Worked example: the dangerous pool.</b> In the troubleshoot lab, <code>show ip dhcp pool CAMPUS</code> shows <b>Excluded 254 / Total 254</b> and Current index 0.0.0.0. Available = 254 − 254 − 0 = 0. The pool exists and looks correct in the running-config, but it can never lease anything, because somebody typed <code>ip dhcp excluded-address 192.168.10.1 192.168.10.254</code> instead of .1 to .10.</p></div>

<h3>show ip dhcp conflict: addresses in dispute</h3>
<pre class="out">R1# show ip dhcp conflict
IP address        Detection method   Detection time          VRF
<span class="hl">192.168.10.21     Ping               Sep 29 2026 09:12 AM</span></pre>
<p>A conflict means the server pinged the address before offering it and got a reply (method <b>Ping</b>), or a client declined it after its own ARP check (method <b>Gratuitous ARP</b>). The server will not offer a conflicted address until you clear it. Always find the static device first; then <code>clear ip dhcp conflict 192.168.10.21</code> or <code>clear ip dhcp conflict *</code>.</p>

<h3>show ip dhcp server statistics: is anything arriving?</h3>
<pre class="out">R1# show ip dhcp server statistics
Memory usage         23512
Address pools        2
Database agents      0
Automatic bindings   4
Manual bindings      0
Expired bindings     0
Malformed messages   0
Secure arp entries   0

Message              Received
BOOTREQUEST          0
<span class="hl">DHCPDISCOVER         4</span>
DHCPREQUEST          4
DHCPDECLINE          0
DHCPRELEASE          0
DHCPINFORM           0

Message              Sent
BOOTREPLY            0
<span class="hl">DHCPOFFER            4</span>
DHCPACK              4
DHCPNAK              0</pre>
<p>Statistics answer the key troubleshooting question: <b>did the Discover reach the server at all?</b> If DHCPDISCOVER does not increase when a remote PC tries, the problem is before the server (relay, routing, ACL). If Discovers increase but Offers do not, the problem is in the server (no matching pool, pool exhausted, everything excluded). Clear the counters with <code>clear ip dhcp server statistics</code> before a test.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Which command answers which question">
<rect x="10" y="20" width="300" height="60" rx="10" fill="#bae6fd"/><text x="160" y="45" text-anchor="middle" class="svg-ink" font-size="13">Did the request arrive?</text><text x="160" y="66" text-anchor="middle" class="svg-muted" font-size="12">server statistics (DISCOVER count)</text>
<rect x="330" y="20" width="300" height="60" rx="10" fill="#bbf7d0"/><text x="480" y="45" text-anchor="middle" class="svg-ink" font-size="13">Is there anything to give?</text><text x="480" y="66" text-anchor="middle" class="svg-muted" font-size="12">show ip dhcp pool</text>
<rect x="10" y="95" width="300" height="60" rx="10" fill="#fde68a"/><text x="160" y="120" text-anchor="middle" class="svg-ink" font-size="13">Who got an address?</text><text x="160" y="141" text-anchor="middle" class="svg-muted" font-size="12">show ip dhcp binding</text>
<rect x="330" y="95" width="300" height="60" rx="10" fill="#fed7aa"/><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="13">Which addresses are blocked?</text><text x="480" y="141" text-anchor="middle" class="svg-muted" font-size="12">show ip dhcp conflict</text>
</svg><p class="cap">Four questions, four commands: ask them in this order during a ticket.</p></div>

<h3>Debug: watching DORA live (concept)</h3>
<p>When the show commands are not enough, IOS can print each DHCP event: <code>debug ip dhcp server events</code> (bindings created, expired, conflicts) and <code>debug ip dhcp server packet</code> (every DISCOVER, OFFER, REQUEST, ACK with the client ID and giaddr). On a router that is a DHCP client, <code>debug dhcp detail</code> shows the client side.</p>
<pre class="out">DHCPD: DHCPDISCOVER received from client 0100.5079.6668.02 through relay 192.168.20.1.
DHCPD: Sending DHCPOFFER to client 0100.5079.6668.02 (192.168.20.21).
DHCPD: DHCPREQUEST received from client 0100.5079.6668.02.
DHCPD: Sending DHCPACK to client 0100.5079.6668.02 (192.168.20.21).</pre>
<p>Notice "through relay 192.168.20.1": that is the giaddr, proof that the relay did its job. Always stop debugs with <code>undebug all</code>, and be careful on a busy production server: debug output goes to the CPU first, and <code>debug ip dhcp server packet</code> on a router serving thousands of clients can hurt it. Use <code>terminal monitor</code> to see debug output over SSH.</p>

<div class="warn"><p><b>Common mistakes.</b> Clearing all bindings on a live server "to start fresh" (clients keep their addresses; the server may then hand the same address to a new client, causing conflicts). Clearing conflicts without fixing the static host (the conflict comes straight back). Leaving a packet debug running on a production router.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which command shows what: leases = <code>show ip dhcp binding</code>; pool usage = <code>show ip dhcp pool</code>; ping/gratuitous-ARP conflicts = <code>show ip dhcp conflict</code>; message counters = <code>show ip dhcp server statistics</code>. Relayed bindings show Interface Unknown.</p></div>

<div class="scn"><h4>The pool that ran dry on exam day</h4><p>On a university exam morning, students in one hall got 169.254 addresses while the rest of the campus was fine. <code>show ip dhcp server statistics</code> showed Discovers rising and Offers flat. <code>show ip dhcp pool HALL3</code> showed Total 126, Excluded 10, Leased 116: the /25 was full, because a lease of 8 days held addresses of phones that had visited all week. The engineer shortened the lease to 4 hours, cleared bindings older than the day's start with the hall's IT lead present, and later resized the subnet to /24.</p><p><b>Lesson:</b> "no address" with Discovers arriving means the server has nothing to give. Size pools and leases for how devices really behave.</p></div>

<div class="iv"><p class="q">"A user has no address. Which commands do you run on the DHCP server, and in what order?"</p><p>First <code>show ip dhcp server statistics</code> while the user retries, to see if Discovers arrive. If not, look at the relay and path. If yes, <code>show ip dhcp pool</code> for the matching pool: Total, Excluded, Leased. Then <code>show ip dhcp conflict</code> for blocked addresses, and <code>show ip dhcp binding</code> to confirm the lease once it works. Mention debug as a last resort with care on production.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show ip dhcp binding</code>: IP, client ID (01 + MAC), expiry, type; Interface Unknown = relayed.</li>
<li><code>show ip dhcp pool</code>: Total, Leased, Excluded; available = Total − Excluded − Leased.</li>
<li><code>show ip dhcp conflict</code>: addresses skipped after a ping or gratuitous ARP conflict.</li>
<li><code>show ip dhcp server statistics</code>: tells you whether Discovers reach the server at all.</li>
<li>Debug shows DORA live, including giaddr; stop it with <code>undebug all</code>.</li>
</ul></div>
`,hi:`
<p>Achha hotel manager complaints ka wait nahi karta. Har subah woh occupancy board dekhta hai: kaunse rooms bhare hain, kitne khaali hain, kal raat kin mein problem hui. Cisco DHCP server par chaar show commands wahi board hain. Inhe jaldi padhna seekho to zyada tar DHCP tickets ghanton nahi, minutes mein solve hote hain.</p>

<h3>show ip dhcp binding: kiske paas kya hai</h3>
<pre class="out">R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address      Client-ID/              Lease expiration        Type       State      Interface
                Hardware address/
                User name
192.168.10.21   0100.5079.6668.00       Oct 01 2026 09:14 AM    Automatic  Active     GigabitEthernet0/0
192.168.10.22   0100.5079.6668.01       Oct 01 2026 09:15 AM    Automatic  Active     GigabitEthernet0/0
<span class="hl">192.168.20.21   0100.5079.6668.02       Oct 01 2026 09:15 AM    Automatic  Active     Unknown</span>
192.168.20.22   0100.5079.6668.03       Oct 01 2026 09:16 AM    Automatic  Active     Unknown</pre>
<p>Column by column padho. <b>IP address</b> leased address hai. <b>Client-ID</b> <code>01</code> plus client MAC hai (0050.7966.6800 ban jaata hai 0100.5079.6668.00). <b>Lease expiration</b> woh time hai jab renew na hone par binding khatam hogi. <b>Type</b> Automatic (pool se) ya Manual (reservation) hai. <b>Interface</b> woh hai jahan request aayi; <b>Unknown</b> ka matlab relay se aayi. Yahan chaar bindings ka matlab chaaron lab PCs successful hain, bilkul wahi jo configuration lab verify karne ko kehta hai.</p>
<p>Ek user dhoondhne ke liye filter karo: <code>show ip dhcp binding | include 6668.02</code>. Address free karne ke liye <code>clear ip dhcp binding 192.168.20.21</code>, ya sab ke liye <code>clear ip dhcp binding *</code> (clients apna address agle renew tak use karte rehte hain, isliye pehle users ko bata do).</p>

<h3>show ip dhcp pool: har pool kitna bhara hai</h3>
<pre class="out">R1# show ip dhcp pool LAN10

Pool LAN10 :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 <span class="hl">Total addresses                : 254
 Leased addresses               : 2
 Excluded addresses             : 20</span>
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased/Excluded/Total
 192.168.10.23        192.168.10.1     - 192.168.10.254    2     / 20    / 254</pre>
<p>Yeh sabse useful DHCP command hai. <b>Total</b> network ka har usable address hai, <b>Excluded</b> batata hai aapke global exclusions kitne hatate hain, <b>Leased</b> batata hai kitne use mein hain, aur <b>Current index</b> agla address hai jo server try karega. Quick health check: Total minus Excluded minus Leased = abhi available addresses. Yahan 254 − 20 − 2 = 232.</p>
<div class="eg"><p><b>Worked example: khatarnak pool.</b> Troubleshoot lab mein <code>show ip dhcp pool CAMPUS</code> dikhata hai <b>Excluded 254 / Total 254</b> aur Current index 0.0.0.0. Available = 254 − 254 − 0 = 0. Pool exist karta hai aur running-config mein sahi dikhta hai, lekin kabhi kuch lease nahi kar sakta, kyunki kisi ne .1 se .10 ki jagah <code>ip dhcp excluded-address 192.168.10.1 192.168.10.254</code> type kar diya.</p></div>

<h3>show ip dhcp conflict: vivaad wale addresses</h3>
<pre class="out">R1# show ip dhcp conflict
IP address        Detection method   Detection time          VRF
<span class="hl">192.168.10.21     Ping               Sep 29 2026 09:12 AM</span></pre>
<p>Conflict ka matlab hai server ne offer karne se pehle address ping kiya aur reply aaya (method <b>Ping</b>), ya client ne apne ARP check ke baad use decline kiya (method <b>Gratuitous ARP</b>). Server conflicted address tab tak offer nahi karega jab tak aap use clear na karo. Hamesha pehle static device dhoondho; phir <code>clear ip dhcp conflict 192.168.10.21</code> ya <code>clear ip dhcp conflict *</code>.</p>

<h3>show ip dhcp server statistics: kuch aa bhi raha hai?</h3>
<pre class="out">R1# show ip dhcp server statistics
Memory usage         23512
Address pools        2
Database agents      0
Automatic bindings   4
Manual bindings      0
Expired bindings     0
Malformed messages   0
Secure arp entries   0

Message              Received
BOOTREQUEST          0
<span class="hl">DHCPDISCOVER         4</span>
DHCPREQUEST          4
DHCPDECLINE          0
DHCPRELEASE          0
DHCPINFORM           0

Message              Sent
BOOTREPLY            0
<span class="hl">DHCPOFFER            4</span>
DHCPACK              4
DHCPNAK              0</pre>
<p>Statistics troubleshooting ke key sawaal ka jawab dete hain: <b>kya Discover server tak pahuncha bhi?</b> Agar remote PC ke try karne par DHCPDISCOVER nahi badhta, problem server se pehle hai (relay, routing, ACL). Agar Discovers badhte hain lekin Offers nahi, problem server mein hai (matching pool nahi, pool khatam, sab excluded). Test se pehle counters <code>clear ip dhcp server statistics</code> se clear karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Kaunsa command kis sawaal ka jawab deta hai">
<rect x="10" y="20" width="300" height="60" rx="10" fill="#bae6fd"/><text x="160" y="45" text-anchor="middle" class="svg-ink" font-size="13">Request pahunchi?</text><text x="160" y="66" text-anchor="middle" class="svg-muted" font-size="12">server statistics (DISCOVER count)</text>
<rect x="330" y="20" width="300" height="60" rx="10" fill="#bbf7d0"/><text x="480" y="45" text-anchor="middle" class="svg-ink" font-size="13">Dene ko kuch hai?</text><text x="480" y="66" text-anchor="middle" class="svg-muted" font-size="12">show ip dhcp pool</text>
<rect x="10" y="95" width="300" height="60" rx="10" fill="#fde68a"/><text x="160" y="120" text-anchor="middle" class="svg-ink" font-size="13">Kisko address mila?</text><text x="160" y="141" text-anchor="middle" class="svg-muted" font-size="12">show ip dhcp binding</text>
<rect x="330" y="95" width="300" height="60" rx="10" fill="#fed7aa"/><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="13">Kaunse addresses blocked hain?</text><text x="480" y="141" text-anchor="middle" class="svg-muted" font-size="12">show ip dhcp conflict</text>
</svg><p class="cap">Chaar sawaal, chaar commands: ticket ke dauraan inhe isi order mein poocho.</p></div>

<h3>Debug: DORA live dekhna (concept)</h3>
<p>Jab show commands kaafi na hon, IOS har DHCP event print kar sakta hai: <code>debug ip dhcp server events</code> (bindings bani, expire hui, conflicts) aur <code>debug ip dhcp server packet</code> (har DISCOVER, OFFER, REQUEST, ACK client ID aur giaddr ke saath). Jo router DHCP client hai us par <code>debug dhcp detail</code> client side dikhata hai.</p>
<pre class="out">DHCPD: DHCPDISCOVER received from client 0100.5079.6668.02 through relay 192.168.20.1.
DHCPD: Sending DHCPOFFER to client 0100.5079.6668.02 (192.168.20.21).
DHCPD: DHCPREQUEST received from client 0100.5079.6668.02.
DHCPD: Sending DHCPACK to client 0100.5079.6668.02 (192.168.20.21).</pre>
<p>"through relay 192.168.20.1" dekho: yeh giaddr hai, saboot ki relay ne apna kaam kiya. Debugs hamesha <code>undebug all</code> se band karo, aur busy production server par dhyan rakho: debug output pehle CPU par jaata hai, aur hazaaron clients serve karne wale router par <code>debug ip dhcp server packet</code> use nuksaan pahuncha sakta hai. SSH par debug output dekhne ke liye <code>terminal monitor</code> use karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Live server par "fresh start" ke liye saari bindings clear kar dena (clients apne addresses rakhte hain; server phir wahi address naye client ko de sakta hai, conflicts banate hue). Static host theek kiye bina conflicts clear karna (conflict turant wapas aata hai). Production router par packet debug chalta chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaunsa command kya dikhata hai yeh jaano: leases = <code>show ip dhcp binding</code>; pool usage = <code>show ip dhcp pool</code>; ping/gratuitous-ARP conflicts = <code>show ip dhcp conflict</code>; message counters = <code>show ip dhcp server statistics</code>. Relayed bindings mein Interface Unknown dikhta hai.</p></div>

<div class="scn"><h4>Exam ke din khaali hua pool</h4><p>University exam ki subah, ek hall ke students ko 169.254 addresses mile jabki baaki campus theek tha. <code>show ip dhcp server statistics</code> mein Discovers badh rahe the aur Offers flat the. <code>show ip dhcp pool HALL3</code> ne Total 126, Excluded 10, Leased 116 dikhaya: /25 bhar gaya tha, kyunki 8 din ki lease ne poore hafte aaye phones ke addresses pakad rakhe the. Engineer ne lease 4 ghante ki ki, hall ke IT lead ki maujoodgi mein din shuru hone se purani bindings clear ki, aur baad mein subnet /24 kar diya.</p><p><b>Seekh:</b> Discovers aa rahe hain phir bhi "koi address nahi" ka matlab hai server ke paas dene ko kuch nahi. Pools aur leases devices ke asli behaviour ke hisaab se size karo.</p></div>

<div class="iv"><p class="q">"User ke paas address nahi hai. DHCP server par kaunse commands chalaoge, aur kis order mein?"</p><p>Pehle <code>show ip dhcp server statistics</code> jab user retry kar raha ho, yeh dekhne ke liye ki Discovers aa rahe hain ya nahi. Nahi, to relay aur path dekho. Haan, to matching pool ke liye <code>show ip dhcp pool</code>: Total, Excluded, Leased. Phir blocked addresses ke liye <code>show ip dhcp conflict</code>, aur kaam karne par lease confirm karne ke liye <code>show ip dhcp binding</code>. Debug ko aakhri option ke roop mein batao, production par saavdhani ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show ip dhcp binding</code>: IP, client ID (01 + MAC), expiry, type; Interface Unknown = relayed.</li>
<li><code>show ip dhcp pool</code>: Total, Leased, Excluded; available = Total − Excluded − Leased.</li>
<li><code>show ip dhcp conflict</code>: ping ya gratuitous ARP conflict ke baad skip hue addresses.</li>
<li><code>show ip dhcp server statistics</code>: batata hai ki Discovers server tak pahunch bhi rahe hain ya nahi.</li>
<li>Debug DORA live dikhata hai, giaddr ke saath; ise <code>undebug all</code> se band karo.</li>
</ul></div>
`}};export{e as default};