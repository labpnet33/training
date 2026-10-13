var e=e=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Autoconfig selects IS-IS interfaces"><rect x="20" y="30" width="150" height="100" rx="10" fill="#bae6fd"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><text x="95" y="80" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 customer LAN</text><text x="95" y="105" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 core (IS-IS)</text><rect x="260" y="40" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="335" y="65" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1: LDP on</text><rect x="260" y="95" width="150" height="40" rx="8" fill="#fed7aa"/><text x="335" y="120" text-anchor="middle" class="svg-ink" font-size="12">Gi0/0: no LDP</text><line x1="170" y1="75" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="170" y1="90" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><text x="520" y="62" text-anchor="middle" class="svg-accent" font-size="12">ip router isis</text><text x="520" y="117" text-anchor="middle" class="svg-muted" font-size="12">no IS-IS: stays IP</text></svg><p class="cap">`+e+`</p></div>`,t={id:`ldp-autoconfig-isis`,h:{en:`Building the MPLS core: LDP autoconfig under IS-IS`,hi:`MPLS core banana: IS-IS ke neeche LDP autoconfig`},body:{en:`
<p>This is the first lab: <i>An MPLS core in four commands</i>. The core already runs IS-IS level 2 with wide metrics. You will enable LDP on every IS-IS interface without touching each interface, pin the LDP identity to the loopback, and prove that traffic is label-switched.</p>

<h3>The traditional way and the autoconfig way</h3>
<p>The classic method is <code>mpls ip</code> on each interface. On a 40-interface core router that is 40 lines and a risk of forgetting one. <b>LDP autoconfig</b> enables LDP on every interface that runs the IGP, with one command under the IGP process. This matches the SP principle: if IS-IS runs on a link, LDP runs on it.</p>
<pre class="code"><span class="c">! On PE1, P1, P2 and PE2 (lab solution)</span>
mpls label protocol ldp
mpls ldp router-id Loopback0 force
router isis
 mpls ldp autoconfig
<span class="c">! Reference configuration: opt one interface out</span>
interface GigabitEthernet0/3
 no mpls ldp igp autoconfig</pre>
<ul>
<li><b>mpls label protocol ldp</b> selects LDP as the label distribution protocol (the default on modern IOS XE, but common in templates).</li>
<li><b>mpls ldp router-id Loopback0 force</b> sets the LDP router ID (and so the transport address) to the loopback. <code>force</code> applies it at once even if LDP is already running.</li>
<li><b>mpls ldp autoconfig</b> under <code>router isis</code> enables LDP on interfaces with <code>ip router isis</code>.</li>
</ul>
<p>The PE-facing customer LANs are not in IS-IS in this lab, so they stay unlabelled: customers receive IP, not MPLS. That is correct security and design.</p>

<h3>Verification</h3>
<pre class="out">PE1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
GigabitEthernet0/1     <span class="hl">Yes (ldp)</span>     No       No  No     Yes

PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.2:0; Local LDP Ident 10.0.255.1:0
        State: Oper; Msgs sent/rcvd: 8/8; Downstream
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.2

PE1# show mpls ldp discovery
 Local LDP Identifier:
    10.0.255.1:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/1 (ldp): xmit/recv
            LDP Id: 10.0.255.2:0</pre>
<p>Only Gi0/1 is listed: Gi0/0 faces the customer and has no IS-IS, so autoconfig left it alone. "xmit/recv" means we send and hear hellos. Do the same on P1 and you see two neighbours (PE1 and P2), P2 sees two (P1 and PE2).</p>
@@D@@

<h3>Prove the labels (task 2)</h3>
<pre class="out">PC1&gt; ping 192.168.2.10
84 bytes from 192.168.2.10 icmp_seq=1 ttl=60 time=0.500 ms

PE1# traceroute 192.168.2.10
  1 10.0.12.2 [MPLS: Label 21 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.23.3 [MPLS: Label 19 Exp 0] 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec</pre>
<p>Push at PE1, swap at P1 (21 to 19), pop at P2. The ping works and the traceroute carries labels on the core hops.</p>

<h3>Who pops for PE2's loopback? (task 3)</h3>
<p>Look at <code>show mpls forwarding-table</code> on the core routers and find the <b>Pop Label</b> entry for 10.0.255.4/32:</p>
<pre class="out">P2# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
17         <span class="hl">Pop Label</span>  10.0.255.4/32    0             Gi0/3      10.0.34.4
P1# show mpls forwarding-table
18         17         10.0.255.4/32    0             Gi0/2      10.0.23.3</pre>
<p>P1 swaps 18 for 17; P2 pops. P2 is directly connected to PE2 and PE2 advertised imp-null for its own loopback, so the answer is <b>P2</b>.</p>

<div class="eg"><p><b>Worked example: partial configuration.</b> If you enter only the first two commands and no autoconfig, PE1 shows nothing:</p>
<pre class="out">PE1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
PE1# show mpls ldp neighbor</pre>
<p>Both tables stay empty because no interface is MPLS-enabled yet. The router ID alone does not start LDP on links.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing mpls ip on some interfaces and forgetting others, so a chain of LSRs has a gap. Using a router ID loopback that IS-IS does not advertise (chapter 5 shows what happens). Forgetting the label protocol on only one router; each router needs it.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>mpls ldp autoconfig</code> goes under the IGP, and it selects interfaces by IGP membership. <code>no mpls ldp igp autoconfig</code> goes under the interface to exclude it.</p></div>

<div class="scn"><h4>The forgotten line card</h4><p>A carrier added a new 10G link and enabled IS-IS but not LDP. Traffic still flowed (IP), but MPLS VPN traffic over that link broke after a failover. After moving to autoconfig, every new IS-IS interface became MPLS-enabled the moment IS-IS was configured.</p><p><b>Lesson:</b> let the IGP membership drive MPLS to avoid human gaps.</p></div>

<div class="iv"><p class="q">"How do you enable LDP on all core interfaces efficiently?"</p><p>Use mpls ldp autoconfig under router isis, set the LDP router ID to the IS-IS-advertised loopback with force, and use no mpls ldp igp autoconfig for exceptions. Verify with show mpls interfaces, show mpls ldp neighbor and a traceroute that shows labels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>mpls ldp autoconfig under router isis enables LDP on IS-IS interfaces.</li>
<li>mpls ldp router-id Loopback0 force pins the identity to the loopback.</li>
<li>Customer-facing interfaces without IS-IS stay unlabelled.</li>
<li>Verify with show mpls interfaces, ldp neighbor, forwarding-table, traceroute.</li>
<li>PHP means the penultimate router (P2) pops for PE2's loopback.</li>
</ul></div>
`.replace(`@@D@@`,e(`Autoconfig follows IS-IS: only interfaces with ip router isis get LDP.`)),hi:`
<p>Yeh pehla lab hai: <i>Chaar commands mein MPLS core</i>. Core par pehle se IS-IS level 2 wide metrics ke saath chal raha hai. Aap har interface ko chhue bina har IS-IS interface par LDP on karoge, LDP identity ko loopback par pin karoge, aur prove karoge ki traffic label-switched hai.</p>

<h3>Traditional tareeka aur autoconfig tareeka</h3>
<p>Classic method har interface par <code>mpls ip</code> hai. 40-interface core router par yeh 40 lines hain aur ek bhoolne ka risk. <b>LDP autoconfig</b> IGP process ke neeche ek command se har us interface par LDP on karta hai jo IGP chalata hai. Yeh SP principle se match karta hai: jis link par IS-IS chalta hai us par LDP chalta hai.</p>
<pre class="code"><span class="c">! PE1, P1, P2 aur PE2 par (lab solution)</span>
mpls label protocol ldp
mpls ldp router-id Loopback0 force
router isis
 mpls ldp autoconfig
<span class="c">! Reference configuration: ek interface ko bahar rakho</span>
interface GigabitEthernet0/3
 no mpls ldp igp autoconfig</pre>
<ul>
<li><b>mpls label protocol ldp</b> LDP ko label distribution protocol chunta hai (modern IOS XE par default, lekin templates mein aam).</li>
<li><b>mpls ldp router-id Loopback0 force</b> LDP router ID (aur isliye transport address) ko loopback par set karta hai. <code>force</code> LDP pehle se chal raha ho tab bhi turant laagu karta hai.</li>
<li><b>mpls ldp autoconfig</b> <code>router isis</code> ke neeche <code>ip router isis</code> wale interfaces par LDP on karta hai.</li>
</ul>
<p>PE ke customer-facing LANs is lab mein IS-IS mein nahi hain, isliye woh unlabelled rehte hain: customers ko IP milta hai, MPLS nahi. Yeh sahi security aur design hai.</p>

<h3>Verification</h3>
<pre class="out">PE1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
GigabitEthernet0/1     <span class="hl">Yes (ldp)</span>     No       No  No     Yes

PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.2:0; Local LDP Ident 10.0.255.1:0
        State: Oper; Msgs sent/rcvd: 8/8; Downstream
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.2

PE1# show mpls ldp discovery
 Local LDP Identifier:
    10.0.255.1:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/1 (ldp): xmit/recv
            LDP Id: 10.0.255.2:0</pre>
<p>Sirf Gi0/1 listed hai: Gi0/0 customer ki taraf hai aur IS-IS nahi, isliye autoconfig ne use chhoda. "xmit/recv" matlab hum hellos bhejte aur sunte hain. P1 par yahi karo to do neighbours dikhte hain (PE1 aur P2), P2 ko do (P1 aur PE2).</p>
@@D@@

<h3>Labels prove karo (task 2)</h3>
<pre class="out">PC1&gt; ping 192.168.2.10
84 bytes from 192.168.2.10 icmp_seq=1 ttl=60 time=0.500 ms

PE1# traceroute 192.168.2.10
  1 10.0.12.2 [MPLS: Label 21 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.23.3 [MPLS: Label 19 Exp 0] 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec</pre>
<p>PE1 par push, P1 par swap (21 se 19), P2 par pop. Ping chalta hai aur traceroute core hops par labels dikhata hai.</p>

<h3>PE2 ke loopback ke liye kaun pop karta hai? (task 3)</h3>
<p>Core routers par <code>show mpls forwarding-table</code> dekho aur 10.0.255.4/32 ke liye <b>Pop Label</b> entry dhundo:</p>
<pre class="out">P2# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
17         <span class="hl">Pop Label</span>  10.0.255.4/32    0             Gi0/3      10.0.34.4
P1# show mpls forwarding-table
18         17         10.0.255.4/32    0             Gi0/2      10.0.23.3</pre>
<p>P1 18 ko 17 se swap karta hai; P2 pop karta hai. P2 PE2 se directly connected hai aur PE2 ne apne loopback ke liye imp-null advertise kiya, isliye jawab <b>P2</b> hai.</p>

<div class="eg"><p><b>Worked example: partial configuration.</b> Agar aap sirf pehle do commands daalo aur autoconfig nahi, to PE1 kuch nahi dikhata:</p>
<pre class="out">PE1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
PE1# show mpls ldp neighbor</pre>
<p>Dono tables khaali rehti hain kyunki abhi koi interface MPLS-enabled nahi. Akela router ID links par LDP shuru nahi karta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Kuch interfaces par mpls ip likhna aur baaki bhoolna, jisse LSRs ki chain mein gap aa jaata hai. Aisa router ID loopback use karna jise IS-IS advertise nahi karta (chapter 5 dikhata hai kya hota hai). Label protocol sirf ek router par bhoolna; har router ko chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>mpls ldp autoconfig</code> IGP ke neeche jaata hai, aur interfaces IGP membership se chunta hai. <code>no mpls ldp igp autoconfig</code> interface ke neeche jaakar use exclude karta hai.</p></div>

<div class="scn"><h4>Bhoola hua line card</h4><p>Ek carrier ne naya 10G link joda aur IS-IS on kiya par LDP nahi. Traffic phir bhi chala (IP), lekin failover ke baad us link par MPLS VPN traffic toot gaya. Autoconfig par jaane ke baad har naya IS-IS interface IS-IS configure hote hi MPLS-enabled ho gaya.</p><p><b>Lesson:</b> insaani gaps se bachne ke liye IGP membership ko MPLS drive karne do.</p></div>

<div class="iv"><p class="q">"Saare core interfaces par LDP efficiently kaise on karte ho?"</p><p>router isis ke neeche mpls ldp autoconfig use karo, LDP router ID ko IS-IS-advertised loopback par force ke saath set karo, aur exceptions ke liye no mpls ldp igp autoconfig. show mpls interfaces, show mpls ldp neighbor aur labels dikhane wale traceroute se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>router isis ke neeche mpls ldp autoconfig IS-IS interfaces par LDP on karta hai.</li>
<li>mpls ldp router-id Loopback0 force identity ko loopback par pin karta hai.</li>
<li>IS-IS ke bina customer-facing interfaces unlabelled rehte hain.</li>
<li>show mpls interfaces, ldp neighbor, forwarding-table, traceroute se verify karo.</li>
<li>PHP matlab PE2 ke loopback ke liye penultimate router (P2) pop karta hai.</li>
</ul></div>
`.replace(`@@D@@`,e(`Autoconfig IS-IS ko follow karta hai: sirf ip router isis wale interfaces ko LDP milta hai.`))}};export{t as default};