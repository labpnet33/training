var e={id:`vpnv4`,h:{en:`MP-BGP VPNv4 between the PEs`,hi:`PE routers ke beech MP-BGP VPNv4`},body:{en:`
<p>The core knows nothing about customers; it only knows loopbacks. Customer routes therefore travel on a separate channel, directly between the two PEs. That channel is an iBGP session carrying the VPNv4 address family, like a private courier line running parallel to the public roads.</p>

<h3>Configuring the session</h3>
<pre class="code"><span class="c">! PE1, AS 65000, peering with PE2 loopback</span>
router bgp 65000
 neighbor 10.0.255.5 remote-as 65000
 neighbor 10.0.255.5 update-source Loopback0
 address-family vpnv4
  neighbor 10.0.255.5 activate
  neighbor 10.0.255.5 send-community extended
 exit-address-family
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101
  neighbor 192.168.1.2 activate
  redistribute connected
 exit-address-family</pre>
<p>Three details matter. The session is between loopbacks, so the underlay must give both a route. <code>send-community extended</code> carries the route targets. And the customer neighbor is configured inside the VRF address family, not in the global one.</p>

<h3>What a VPNv4 route contains</h3>
<dl class="terms">
<dt>RD plus prefix</dt><dd>65000:1:172.16.2.0/24.</dd>
<dt>Next hop</dt><dd>The originating PE loopback, 10.0.255.5. Because it is a loopback with a prefix SID, a transport label exists.</dd>
<dt>Extended community</dt><dd>RT:65000:1, used for import.</dd>
<dt>VPN label</dt><dd>The inner label that PE2 allocated for this VRF.</dd></dl>
<pre class="out">PE1# show bgp vpnv4 unicast all 172.16.2.0/24
  Path from 10.0.255.5, valid, internal, best
    Next hop 10.0.255.5, label <span class="hl">24</span>
    Extended Community: <span class="hl">RT:65000:1</span></pre>

<h3>Why the next hop must be a labelled loopback</h3>
<p>The next hop is where the packet is going, and the transport label is derived from it. If the next hop were a link address that is not in the SR domain, there would be no prefix SID and the packet would be sent unlabelled and dropped at the first P router.</p>

<div class="eg"><b>Worked example.</b> PE1 needs the route to 172.16.2.0/24. PE2 learned it from CE2 over eBGP, imported it into BGP VPNv4 with RT 65000:1 and VPN label 24, with itself as next hop. PE1 receives it, matches RT 65000:1 against CUST_A's import list, and installs it into the VRF table.</div>

<div class="warn"><b>Common mistake.</b> Forgetting <code>send-community extended</code>. On many platforms <code>activate</code> turns it on automatically, but a manual removal, or a template without it, silently strips the RTs. Check with <code>show bgp vpnv4 unicast all neighbors</code> and look for extended community capability.</div>

<div class="exam"><b>Exam trap.</b> iBGP does not change the next hop by default. In a VPN design with a single AS this is what you want, but with route reflectors the reflector must not set next-hop-self for VPN routes.</div>

<div class="scn"><h4>Session up, table empty</h4><p>Mumbai received nothing from Chennai. The BGP summary showed an Established session with zero prefixes received. The engineer looked at the receiving side first, then the sender, and found that the sender had no extended community configured towards that neighbor. One line fixed it.</p><p><b>Lesson:</b> a prefix count of zero with an up session often means RTs were never sent.</p></div>

<div class="iv"><p class="q">"What does the VPNv4 next hop have to be reachable by?"</p><p>By a labelled path: a loopback with an SR prefix SID in the IS-IS domain. Without it the transport label is missing and traffic is dropped inside the core.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPNv4 peers sit on PE loopbacks inside AS 65000.</li>
<li><code>send-community extended</code> is essential for RTs.</li>
<li>The next hop must be a labelled loopback.</li>
<li>Look at both <code>show bgp vpnv4</code> and the VRF routing table.</li>
</ul></div>
`,hi:`
<p>Core ko customers ke baare mein kuch nahi pata; use sirf loopbacks pata hain. Isliye customer routes alag channel par, seedhe do PEs ke beech, jaate hain. Woh channel VPNv4 address family le jaane wala iBGP session hai, jaise public sadkon ke saath chalti private courier line.</p>

<h3>Session configure karna</h3>
<pre class="code"><span class="c">! PE1, AS 65000, PE2 loopback ke saath peering</span>
router bgp 65000
 neighbor 10.0.255.5 remote-as 65000
 neighbor 10.0.255.5 update-source Loopback0
 address-family vpnv4
  neighbor 10.0.255.5 activate
  neighbor 10.0.255.5 send-community extended
 exit-address-family
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101
  neighbor 192.168.1.2 activate
  redistribute connected
 exit-address-family</pre>
<p>Teen baatein zaroori hain. Session loopbacks ke beech hai, isliye underlay ko dono ko route dena hoga. <code>send-community extended</code> route targets le jaata hai. Aur customer neighbor VRF address family ke andar configure hota hai, global mein nahi.</p>

<h3>VPNv4 route mein kya hota hai</h3>
<dl class="terms">
<dt>RD plus prefix</dt><dd>65000:1:172.16.2.0/24.</dd>
<dt>Next hop</dt><dd>Originating PE ka loopback, 10.0.255.5. Prefix SID wala loopback hone ki wajah se transport label maujood hai.</dd>
<dt>Extended community</dt><dd>RT:65000:1, import ke liye.</dd>
<dt>VPN label</dt><dd>Andar wala label jo PE2 ne is VRF ke liye allocate kiya.</dd></dl>
<pre class="out">PE1# show bgp vpnv4 unicast all 172.16.2.0/24
  Path from 10.0.255.5, valid, internal, best
    Next hop 10.0.255.5, label <span class="hl">24</span>
    Extended Community: <span class="hl">RT:65000:1</span></pre>

<h3>Next hop labelled loopback kyun hona chahiye</h3>
<p>Next hop woh jagah hai jahan packet ja raha hai, aur transport label usi se nikalta hai. Agar next hop SR domain ke bahar ka link address hota, to prefix SID nahi hota aur packet bina label bheja jaata aur pehle P router par drop ho jaata.</p>

<div class="eg"><b>Worked example.</b> PE1 ko 172.16.2.0/24 ka route chahiye. PE2 ne use CE2 se eBGP par seekha, RT 65000:1 aur VPN label 24 ke saath BGP VPNv4 mein import kiya, khud ko next hop banakar. PE1 use receive karta hai, RT 65000:1 ko CUST_A ki import list se match karta hai, aur VRF table mein install karta hai.</div>

<div class="warn"><b>Common mistake.</b> <code>send-community extended</code> bhool jaana. Kai platforms par <code>activate</code> ise automatically on kar deta hai, par haath se hataane ya bina iske template se RTs chupchaap chhin jaate hain. <code>show bgp vpnv4 unicast all neighbors</code> se check karo aur extended community capability dekho.</div>

<div class="exam"><b>Exam trap.</b> iBGP default mein next hop nahi badalta. Single AS wale VPN design mein yahi chahiye, par route reflectors ke saath reflector ko VPN routes ke liye next-hop-self nahi lagana chahiye.</div>

<div class="scn"><h4>Session up, table khaali</h4><p>Mumbai ko Chennai se kuch nahi mila. BGP summary Established session aur zero prefixes received dikha raha tha. Engineer ne pehle receiving side dekhi, phir sender, aur paaya ki sender ke paas us neighbor ki taraf extended community configure nahi thi. Ek line ne theek kar diya.</p><p><b>Lesson:</b> up session ke saath zero prefix count ka matlab aksar RTs kabhi bheje hi nahi gaye.</p></div>

<div class="iv"><p class="q">"VPNv4 next hop kis se reachable hona chahiye?"</p><p>Labelled path se: IS-IS domain mein SR prefix SID wale loopback se. Iske bina transport label nahi hota aur traffic core ke andar drop ho jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPNv4 peers AS 65000 ke andar PE loopbacks par baithte hain.</li>
<li>RTs ke liye <code>send-community extended</code> zaroori hai.</li>
<li>Next hop labelled loopback hona chahiye.</li>
<li><code>show bgp vpnv4</code> aur VRF routing table dono dekho.</li>
</ul></div>
`}};export{e as default};