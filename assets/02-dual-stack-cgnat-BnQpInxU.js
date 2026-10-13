var e={id:`dual-stack-cgnat`,h:{en:`Dual-stack and CGNAT: stretching IPv4 while IPv6 grows`,hi:`Dual-stack aur CGNAT: IPv6 badhte waqt IPv4 ko kheenchna`},body:{en:`
<p>Dual-stack is the simplest idea: every interface and every router speaks both IPv4 and IPv6. Applications choose IPv6 when it works and fall back to IPv4. It needs no translation, so it is the preferred end state. Its weakness is that every subscriber still needs an IPv4 address, and those are gone. That is why dual-stack is almost always paired with <b>CGNAT</b>.</p>

<h3>What CGNAT does</h3>
<p>Home routers already do NAT: many private devices share one public address. CGNAT adds a <b>second NAT layer</b> inside the provider. The home router gets an address from a shared range, and the provider NAT maps many homes onto a small public pool. The result is often called <b>NAT444</b>, because the path has three IPv4 segments: private home, shared provider range, public Internet.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NAT444 path">
<rect x="15" y="50" width="110" height="60" rx="10" fill="#bae6fd"/><text x="70" y="78" text-anchor="middle" class="svg-ink" font-size="13">Home LAN</text><text x="70" y="96" text-anchor="middle" class="svg-muted" font-size="11">192.168.1.0/24</text>
<rect x="165" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="220" y="78" text-anchor="middle" class="svg-ink" font-size="13">CPE NAT44</text><text x="220" y="96" text-anchor="middle" class="svg-muted" font-size="11">100.64.x.x outside</text>
<rect x="315" y="50" width="130" height="60" rx="10" fill="#fde68a"/><text x="380" y="78" text-anchor="middle" class="svg-ink" font-size="13">CGNAT</text><text x="380" y="96" text-anchor="middle" class="svg-muted" font-size="11">shared pool outside</text>
<rect x="485" y="50" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="555" y="78" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="555" y="96" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.0/24 pool</text>
<line x1="125" y1="80" x2="165" y2="80" stroke="#64748b" stroke-width="2"/><line x1="275" y1="80" x2="315" y2="80" stroke="#64748b" stroke-width="2"/><line x1="445" y1="80" x2="485" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Two NAT layers: NAT444</text>
</svg><p class="cap">NAT444: home NAT then carrier NAT.</p></div>

<h3>The shared address space 100.64.0.0/10</h3>
<p>The provider must number the link between the home router and the CGNAT. Using private RFC 1918 space risks overlapping the customer's own LAN. The IETF therefore reserved <b>100.64.0.0/10</b> as <b>shared address space</b> (RFC 6598) just for this. It is not routable on the public Internet, and it is not RFC 1918, so it will not collide with a home network that uses 192.168.0.0/16.</p>

<h3>How CGNAT shares addresses</h3>
<p>A NAT works at the level of the five-tuple: source and destination address, source and destination port, and protocol. CGNAT is a many-to-one translation in which thousands of subscribers reuse one public address and are separated by <b>port</b>. Two common styles:</p>
<ul>
<li><b>Dynamic port allocation per flow</b>: each new flow gets a public address and port. Simple, but produces a log line per flow.</li>
<li><b>Port-block allocation (deterministic or bulk)</b>: a subscriber receives a block of ports on one public address, for example 1,024 ports. The log needs one entry when the block is assigned. A <b>deterministic</b> design computes the subscriber-to-port mapping from a formula, so almost no logs are needed.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> A public address offers about 64,000 usable ports. If you give each subscriber a block of 2,000 ports, one address serves 32 subscribers. A pool of /24 (256 addresses) then serves 8,192 subscribers. If a subscriber opens more than 2,000 simultaneous sessions, for example a household with many streaming boxes and a torrent client, new connections fail until a flow times out or a second block is granted.</p></div>

<h3>What breaks with CGNAT</h3>
<ul>
<li><b>Inbound connections</b>: a customer cannot port-forward a game server because the public address is not theirs.</li>
<li><b>Logging and attribution</b>: law enforcement asks who used 198.51.100.7 port 41000 at a time. Without logs or a deterministic mapping, the provider cannot answer.</li>
<li><b>Port exhaustion</b>: a heavy user can consume the whole block.</li>
<li><b>Application layer gateways (ALG)</b> and protocols that embed addresses in payload.</li>
<li><b>Geolocation and reputation</b>: many subscribers share one public address, so one abuser can get the address blocked for all.</li>
<li><b>Shared fate and scaling</b>: the CGNAT is a stateful chokepoint that must be sized for sessions per second and total sessions.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<p>CGNAT platforms differ greatly. A router-based design uses inside and outside interfaces and a pool. The shape below is illustrative of a stateful NAT on a Cisco router; it mirrors ordinary NAT overload, which you can practise in ccna-nat, but carrier platforms use different scale and logging features.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
interface GigabitEthernet0/0/0
 description subscriber side (shared space)
 ip address 100.64.0.1 255.255.0.0
 ip nat inside
interface GigabitEthernet0/0/1
 description Internet side
 ip address 198.51.100.1 255.255.255.0
 ip nat outside
ip nat pool CGN-POOL 198.51.100.10 198.51.100.20 netmask 255.255.255.0
access-list 10 permit 100.64.0.0 0.63.255.255
ip nat inside source list 10 pool CGN-POOL overload</pre>

<div class="warn"><p><b>Common mistakes.</b> Numbering the CPE-to-CGNAT link from RFC 1918 and colliding with customer LANs; sizing the pool by subscriber count but ignoring sessions per subscriber; and not retaining NAT logs for the period the operator is required to keep.</p></div>
<div class="exam"><p><b>Exam trap.</b> The shared address space for CGNAT is 100.64.0.0/10, not 10.0.0.0/8 or 169.254.0.0/16. CGNAT does not remove the need for a public pool; it multiplexes it by port.</p></div>

<div class="scn"><h4>Games stop working after CGNAT</h4><p>After a provider moved a district behind CGNAT, subscribers reported that hosting an online game lobby no longer worked, while browsing was fine. Support confirmed the customer WAN address was in 100.64.0.0/10. The fix was to offer those customers native IPv6 (where the game supports it) or a small opt-out group with a public address.</p><p><b>Lesson:</b> CGNAT breaks inbound reachability; plan IPv6 or a public-address option for those users.</p></div>

<div class="iv"><p class="q">"What is NAT444 and what are its drawbacks?"</p><p>Two stacked IPv4 NATs: the home NAT44 and the carrier NAT44, with 100.64.0.0/10 between them. Drawbacks: no inbound reachability, port exhaustion, more complex logging, ALG issues and shared public-address reputation. Mention that dual-stack lets IPv6 traffic bypass the CGNAT entirely.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual-stack is the preferred end state; CGNAT only stretches IPv4.</li>
<li>NAT444 stacks the home NAT and the carrier NAT.</li>
<li>100.64.0.0/10 is shared address space for the provider-to-CPE segment.</li>
<li>Port-block and deterministic allocation reduce logging.</li>
<li>CGNAT breaks inbound connections and risks port exhaustion.</li>
</ul></div>
`,hi:`
<p>Dual-stack sabse simple idea hai: har interface aur har router IPv4 aur IPv6 dono bolta hai. Applications IPv6 chunte hain jab woh kaam kare aur IPv4 par fall back karte hain. Ismein translation nahi chahiye, isliye yeh preferred end state hai. Iski kamzori yeh hai ki har subscriber ko abhi bhi IPv4 address chahiye, aur woh khatam ho gaye. Isliye dual-stack lagbhag hamesha <b>CGNAT</b> ke saath jodi jaati hai.</p>

<h3>CGNAT kya karta hai</h3>
<p>Home routers pehle se NAT karte hain: kai private devices ek public address share karte hain. CGNAT provider ke andar <b>doosri NAT layer</b> jodta hai. Home router ko shared range se address milta hai, aur provider NAT bahut saare homes ko chhote public pool par map karta hai. Is result ko aksar <b>NAT444</b> kehte hain, kyunki path mein teen IPv4 segments hain: private home, shared provider range, public Internet.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NAT444 path">
<rect x="15" y="50" width="110" height="60" rx="10" fill="#bae6fd"/><text x="70" y="78" text-anchor="middle" class="svg-ink" font-size="13">Home LAN</text><text x="70" y="96" text-anchor="middle" class="svg-muted" font-size="11">192.168.1.0/24</text>
<rect x="165" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="220" y="78" text-anchor="middle" class="svg-ink" font-size="13">CPE NAT44</text><text x="220" y="96" text-anchor="middle" class="svg-muted" font-size="11">bahar 100.64.x.x</text>
<rect x="315" y="50" width="130" height="60" rx="10" fill="#fde68a"/><text x="380" y="78" text-anchor="middle" class="svg-ink" font-size="13">CGNAT</text><text x="380" y="96" text-anchor="middle" class="svg-muted" font-size="11">bahar shared pool</text>
<rect x="485" y="50" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="555" y="78" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="555" y="96" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.0/24 pool</text>
<line x1="125" y1="80" x2="165" y2="80" stroke="#64748b" stroke-width="2"/><line x1="275" y1="80" x2="315" y2="80" stroke="#64748b" stroke-width="2"/><line x1="445" y1="80" x2="485" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Do NAT layers: NAT444</text>
</svg><p class="cap">NAT444: pehle home NAT phir carrier NAT.</p></div>

<h3>Shared address space 100.64.0.0/10</h3>
<p>Provider ko home router aur CGNAT ke beech ke link ko number karna padta hai. Private RFC 1918 space use karne se customer ke apne LAN se overlap ka risk hai. Isliye IETF ne isi kaam ke liye <b>100.64.0.0/10</b> ko <b>shared address space</b> (RFC 6598) ke roop mein reserve kiya. Yeh public Internet par routable nahi hai, aur RFC 1918 nahi hai, isliye 192.168.0.0/16 use karne wale home network se collide nahi karega.</p>

<h3>CGNAT addresses kaise share karta hai</h3>
<p>NAT five-tuple ke level par kaam karta hai: source aur destination address, source aur destination port, aur protocol. CGNAT many-to-one translation hai jisme hazaron subscribers ek public address reuse karte hain aur <b>port</b> se alag kiye jaate hain. Do common styles:</p>
<ul>
<li><b>Per flow dynamic port allocation</b>: har naye flow ko public address aur port milta hai. Simple hai, lekin har flow ki ek log line banti hai.</li>
<li><b>Port-block allocation (deterministic ya bulk)</b>: subscriber ko ek public address par ports ka block milta hai, jaise 1,024 ports. Block assign hone par sirf ek log entry chahiye. <b>Deterministic</b> design subscriber-to-port mapping formula se nikalta hai, isliye lagbhag logs ki zaroorat nahi.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Ek public address lagbhag 64,000 usable ports deta hai. Agar har subscriber ko 2,000 ports ka block do, to ek address 32 subscribers serve karta hai. /24 pool (256 addresses) phir 8,192 subscribers serve karta hai. Agar subscriber 2,000 se zyaada simultaneous sessions kholta hai, jaise kai streaming boxes aur torrent client wala ghar, to naye connections tab tak fail hote hain jab tak koi flow timeout na ho ya doosra block na mile.</p></div>

<h3>CGNAT se kya tootta hai</h3>
<ul>
<li><b>Inbound connections</b>: customer game server port-forward nahi kar sakta kyunki public address uska nahi hai.</li>
<li><b>Logging aur attribution</b>: law enforcement poochta hai ki 198.51.100.7 port 41000 us time kisne use kiya. Logs ya deterministic mapping ke bina provider jawab nahi de sakta.</li>
<li><b>Port exhaustion</b>: heavy user poora block kha sakta hai.</li>
<li><b>Application layer gateways (ALG)</b> aur woh protocols jo payload mein addresses embed karte hain.</li>
<li><b>Geolocation aur reputation</b>: kai subscribers ek public address share karte hain, isliye ek abuser ki wajah se sabke liye address block ho sakta hai.</li>
<li><b>Shared fate aur scaling</b>: CGNAT stateful chokepoint hai jise sessions per second aur total sessions ke liye size karna padta hai.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<p>CGNAT platforms bahut alag hote hain. Router-based design inside aur outside interfaces aur pool use karta hai. Neeche ka shape Cisco router par stateful NAT ka illustration hai; yeh normal NAT overload jaisa hai, jise aap ccna-nat mein practise kar sakte ho, lekin carrier platforms alag scale aur logging features use karte hain.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
interface GigabitEthernet0/0/0
 description subscriber side (shared space)
 ip address 100.64.0.1 255.255.0.0
 ip nat inside
interface GigabitEthernet0/0/1
 description Internet side
 ip address 198.51.100.1 255.255.255.0
 ip nat outside
ip nat pool CGN-POOL 198.51.100.10 198.51.100.20 netmask 255.255.255.0
access-list 10 permit 100.64.0.0 0.63.255.255
ip nat inside source list 10 pool CGN-POOL overload</pre>

<div class="warn"><p><b>Common mistakes.</b> CPE-to-CGNAT link ko RFC 1918 se number karna aur customer LAN se collide hona; pool ko subscriber count se size karna lekin sessions per subscriber ignore karna; aur NAT logs ko utne time tak na rakhna jitna operator ko rakhna zaroori hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> CGNAT ka shared address space 100.64.0.0/10 hai, 10.0.0.0/8 ya 169.254.0.0/16 nahi. CGNAT public pool ki zaroorat khatam nahi karta; woh use port se multiplex karta hai.</p></div>

<div class="scn"><h4>CGNAT ke baad games band</h4><p>Provider ne ek district ko CGNAT ke peeche daala to subscribers ne bataya ki online game lobby host karna band ho gaya, jabki browsing theek thi. Support ne confirm kiya ki customer WAN address 100.64.0.0/10 mein tha. Fix yeh tha ki un customers ko native IPv6 (jahan game support kare) ya public address ke saath chhota opt-out group diya jaaye.</p><p><b>Lesson:</b> CGNAT inbound reachability todta hai; un users ke liye IPv6 ya public-address option plan karo.</p></div>

<div class="iv"><p class="q">"NAT444 kya hai aur iske drawbacks kya hain?"</p><p>Do stacked IPv4 NATs: home NAT44 aur carrier NAT44, beech mein 100.64.0.0/10. Drawbacks: inbound reachability nahi, port exhaustion, complex logging, ALG issues aur shared public-address reputation. Batao ki dual-stack se IPv6 traffic CGNAT ko poori tarah bypass karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual-stack preferred end state hai; CGNAT sirf IPv4 ko kheenchta hai.</li>
<li>NAT444 home NAT aur carrier NAT ko stack karta hai.</li>
<li>100.64.0.0/10 provider-to-CPE segment ke liye shared address space hai.</li>
<li>Port-block aur deterministic allocation logging kam karte hain.</li>
<li>CGNAT inbound connections todta hai aur port exhaustion ka risk rakhta hai.</li>
</ul></div>
`}};export{e as default};