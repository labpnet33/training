var e={id:`dora`,h:{en:`DHCP: how a host gets an address (DORA and the lease)`,hi:`DHCP: host ko address kaise milta hai (DORA aur lease)`},body:{en:`
<p>Picture a student arriving on the first day of college. She does not know anybody, so she stands in the corridor and shouts, "Is there an admissions office here?" Someone replies, "Yes, I can give you roll number 21." She shouts back, "Great, I'll take roll number 21 from you!" so that any other office stops offering. The office confirms: "Done, it's yours for this semester." That shouting conversation is exactly how <b>DHCP</b> (Dynamic Host Configuration Protocol) works.</p>

<h3>The four messages: DORA</h3>
<p>A client that has just connected has no IP address. It cannot send a normal unicast packet, because it has no source address and does not know where the server is. So it uses <b>broadcasts</b> and four messages, remembered as <b>DORA</b>:</p>
<ol>
<li><b>Discover</b> (client → everyone). Source <code>0.0.0.0</code> port 68, destination <code>255.255.255.255</code> port 67. "Is there a DHCP server?" The client includes its MAC address so the server knows who is asking.</li>
<li><b>Offer</b> (server → client). The server picks a free address from its pool and offers it with the mask, gateway, DNS servers and lease time.</li>
<li><b>Request</b> (client → everyone). The client broadcasts which offer it accepts. Broadcasting it tells any other server that offered an address to put its offer back in its pool.</li>
<li><b>Acknowledge</b> (server → client). The server confirms and records the <b>binding</b> (this MAC has this IP until this time). Only now does the client start using the address.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DORA exchange">
<rect x="20" y="10" width="140" height="40" rx="8" fill="#bae6fd"/><text x="90" y="35" text-anchor="middle" class="svg-ink" font-size="14">PC1 (client)</text>
<rect x="480" y="10" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="550" y="35" text-anchor="middle" class="svg-ink" font-size="14">R1 (server)</text>
<line x1="90" y1="50" x2="90" y2="240" stroke="#64748b"/><line x1="550" y1="50" x2="550" y2="240" stroke="#64748b"/>
<line x1="90" y1="80" x2="550" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="74" text-anchor="middle" class="svg-accent" font-size="13">1 Discover (broadcast)</text>
<line x1="550" y1="125" x2="90" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="119" text-anchor="middle" class="svg-ink" font-size="13">2 Offer: 192.168.10.21</text>
<line x1="90" y1="170" x2="550" y2="170" stroke="#64748b" stroke-width="2"/><text x="320" y="164" text-anchor="middle" class="svg-accent" font-size="13">3 Request (broadcast)</text>
<line x1="550" y1="215" x2="90" y2="215" stroke="#64748b" stroke-width="2"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4 Acknowledge: lease 1 day</text>
</svg><p class="cap">DORA. Discover and Request are always broadcasts; Offer and Acknowledge come from the server.</p></div>

<h3>Why broadcasts matter</h3>
<p>Because Discover is a broadcast, it only reaches devices in the same broadcast domain (the same VLAN or subnet). Routers do not forward broadcasts. That is why the DHCP server must either sit on the client's subnet, or the router must act as a <b>DHCP relay</b>, which you will study in chapter 4. Keep this fact in mind: it explains most "clients on one VLAN get no address" tickets.</p>

<h3>The lease lifecycle: renew, rebind, release</h3>
<p>An address is never given forever; it is <b>leased</b>. The lease time is set by the server (on a Cisco IOS router the default is one day; on many Windows servers it is eight days). A client does not wait until the last second:</p>
<ul>
<li>At <b>50%</b> of the lease (timer <b>T1</b>) it sends a unicast Request directly to the server that gave the address: "Can I keep it?" Normally the server Acks and the lease starts again. This is a <b>renewal</b>.</li>
<li>If the server does not answer, at <b>87.5%</b> (timer <b>T2</b>) it broadcasts a Request to any server. This is <b>rebinding</b>.</li>
<li>If the lease expires, the client must stop using the address and start DORA again.</li>
<li>When a user shuts down properly or runs <code>ipconfig /release</code>, the client sends a <b>Release</b> so the address returns to the pool early.</li>
</ul>
<p>Other messages you should recognise: <b>Decline</b> (the client found the offered address already in use, usually detected with ARP), <b>NAK</b> (the server refuses a request, for example after the client moved to another subnet), and <b>Inform</b> (the client already has an address and only wants options such as DNS).</p>

<div class="eg"><p><b>Worked example.</b> PC1 gets <code>192.168.10.21</code> with a lease of 1 day (24 hours) at 09:00 on Monday. T1 is 50% of 24 hours = 12 hours, so at 21:00 PC1 unicasts a Request to 192.168.10.1 and the lease restarts. If R1 had been switched off, PC1 would keep using the address and try again; at T2 (87.5% of 24 = 21 hours, so 06:00 Tuesday) it would broadcast to any server. If nobody answered by 09:00 Tuesday, PC1 would lose the address.</p></div>

<h3>What happens when no server answers: APIPA</h3>
<p>If a Windows, macOS or Linux client sends Discovers and receives nothing, it gives itself an address from <code>169.254.0.0/16</code>. This is called <b>APIPA</b> (Automatic Private IP Addressing) or IPv4 link-local. It lets two hosts on the same cable talk, but there is no gateway, so nothing beyond the subnet works. Seeing <code>169.254.x.x</code> is the single clearest sign that DHCP failed.</p>

<h3>What the client sees in the lab</h3>
<p>The lab PCs use a simple console. <code>ip dhcp</code> runs DORA and prints one letter per message; <code>show ip</code> shows the result.</p>
<pre class="out">PC1&gt; ip dhcp
<span class="hl">DDORA IP 192.168.10.21/24 GW 192.168.10.1</span>

PC1&gt; show ip
NAME        : PC1[1]
IP/MASK     : 192.168.10.21/24
GATEWAY     : 192.168.10.1
DNS         : 192.168.10.1
DHCP SERVER : 192.168.10.1
MAC         : 00:50:79:66:68:01
MTU         : 1500</pre>
<p>If no server answers, the console prints <code>DDD</code> followed by <code>Can't find dhcp server</code>: three Discovers, no Offer.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking the client uses the address as soon as it sees the Offer. It does not. The address is only configured after the Acknowledge. Another mistake: mixing up the ports. The <b>server</b> listens on UDP 67 and the <b>client</b> on UDP 68.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which message does a client send first?" is Discover. "At what point does a client try to renew?" is 50% of the lease (T1). A 169.254 address means APIPA: the client could not reach a DHCP server. It does not mean the server gave out a wrong address.</p></div>

<div class="scn"><h4>Laptops work at the desk but not in the meeting room</h4><p>Users complained that their laptops worked all morning at their desks, but when they walked into the new meeting room and plugged in, the network "hung" for a minute and then showed 169.254 addresses. The engineer captured traffic on the meeting room port: Discovers were leaving the laptop, but no Offer ever came back. The meeting room port had been placed in a new VLAN with no DHCP server and no relay. Moving the port into the staff VLAN (or adding a relay for the new VLAN) fixed it.</p><p><b>Lesson:</b> Discover is a broadcast; it only reaches servers in the same VLAN unless a relay forwards it.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a laptop joins the network and asks for an address."</p><p>Strong answer: name DORA with direction and addressing: Discover broadcast from 0.0.0.0:68 to 255.255.255.255:67, Offer from the server with IP and options, Request broadcast so other servers withdraw, Acknowledge to confirm the binding. Then add the lease lifecycle: renewal at 50% (T1) by unicast, rebinding at 87.5% (T2) by broadcast, and APIPA 169.254/16 if nobody answers. Mentioning T1/T2 separates you from candidates who only memorised DORA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DORA: Discover, Offer, Request, Acknowledge. Discover and Request are broadcasts.</li>
<li>DHCP uses UDP 67 (server) and UDP 68 (client).</li>
<li>Renew at 50% (T1, unicast), rebind at 87.5% (T2, broadcast), restart DORA after expiry.</li>
<li>Release, Decline, NAK and Inform are the other messages worth recognising.</li>
<li>A 169.254.x.x (APIPA) address means no DHCP server answered.</li>
</ul></div>
`,hi:`
<p>College ke pehle din aane wali ek student ko imagine karo. Woh kisi ko nahi jaanti, to corridor mein khadi hokar chillati hai, "Kya yahan koi admissions office hai?" Koi jawab deta hai, "Haan, main tumhe roll number 21 de sakta hoon." Woh wapas chillati hai, "Badhiya, main aapse roll number 21 le rahi hoon!" taaki koi aur office offer karna band kar de. Office confirm karta hai: "Ho gaya, is semester ke liye yeh tumhara hai." Yahi chillane wali baatcheet bilkul waise hi hai jaise <b>DHCP</b> (Dynamic Host Configuration Protocol) kaam karta hai.</p>

<h3>Chaar messages: DORA</h3>
<p>Jo client abhi connect hua hai uske paas IP address nahi hai. Woh normal unicast packet nahi bhej sakta, kyunki uske paas source address nahi hai aur use pata nahi server kahan hai. Isliye woh <b>broadcasts</b> aur chaar messages use karta hai, jinhe <b>DORA</b> se yaad rakhte hain:</p>
<ol>
<li><b>Discover</b> (client → sab). Source <code>0.0.0.0</code> port 68, destination <code>255.255.255.255</code> port 67. "Kya koi DHCP server hai?" Client apna MAC address daalta hai taaki server ko pata chale kaun pooch raha hai.</li>
<li><b>Offer</b> (server → client). Server apne pool se ek free address chunta hai aur use mask, gateway, DNS servers aur lease time ke saath offer karta hai.</li>
<li><b>Request</b> (client → sab). Client broadcast karta hai ki woh kaunsa offer accept kar raha hai. Broadcast karne se kisi bhi doosre server ko, jisne address offer kiya tha, pata chal jaata hai ki woh apna offer wapas pool mein daal de.</li>
<li><b>Acknowledge</b> (server → client). Server confirm karta hai aur <b>binding</b> record karta hai (is MAC ke paas yeh IP is time tak hai). Sirf ab client address use karna shuru karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DORA exchange">
<rect x="20" y="10" width="140" height="40" rx="8" fill="#bae6fd"/><text x="90" y="35" text-anchor="middle" class="svg-ink" font-size="14">PC1 (client)</text>
<rect x="480" y="10" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="550" y="35" text-anchor="middle" class="svg-ink" font-size="14">R1 (server)</text>
<line x1="90" y1="50" x2="90" y2="240" stroke="#64748b"/><line x1="550" y1="50" x2="550" y2="240" stroke="#64748b"/>
<line x1="90" y1="80" x2="550" y2="80" stroke="#64748b" stroke-width="2"/><text x="320" y="74" text-anchor="middle" class="svg-accent" font-size="13">1 Discover (broadcast)</text>
<line x1="550" y1="125" x2="90" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="119" text-anchor="middle" class="svg-ink" font-size="13">2 Offer: 192.168.10.21</text>
<line x1="90" y1="170" x2="550" y2="170" stroke="#64748b" stroke-width="2"/><text x="320" y="164" text-anchor="middle" class="svg-accent" font-size="13">3 Request (broadcast)</text>
<line x1="550" y1="215" x2="90" y2="215" stroke="#64748b" stroke-width="2"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4 Acknowledge: lease 1 din</text>
</svg><p class="cap">DORA. Discover aur Request hamesha broadcasts hote hain; Offer aur Acknowledge server se aate hain.</p></div>

<h3>Broadcasts kyun matter karte hain</h3>
<p>Kyunki Discover ek broadcast hai, yeh sirf same broadcast domain (same VLAN ya subnet) ke devices tak pahunchta hai. Routers broadcasts forward nahi karte. Isiliye DHCP server ya to client ke subnet par hona chahiye, ya router ko <b>DHCP relay</b> ka kaam karna chahiye, jo aap chapter 4 mein padhoge. Yeh fact dimaag mein rakho: yeh zyada tar "ek VLAN ke clients ko address nahi mil raha" tickets ko explain karta hai.</p>

<h3>Lease lifecycle: renew, rebind, release</h3>
<p>Address kabhi hamesha ke liye nahi diya jaata; woh <b>lease</b> hota hai. Lease time server set karta hai (Cisco IOS router par default ek din hai; kai Windows servers par aath din). Client aakhri second tak wait nahi karta:</p>
<ul>
<li>Lease ke <b>50%</b> par (timer <b>T1</b>) woh seedha us server ko unicast Request bhejta hai jisne address diya tha: "Kya main ise rakh sakta hoon?" Normally server Ack karta hai aur lease dobara shuru ho jaati hai. Yeh <b>renewal</b> hai.</li>
<li>Agar server jawab na de, to <b>87.5%</b> par (timer <b>T2</b>) woh kisi bhi server ko Request broadcast karta hai. Yeh <b>rebinding</b> hai.</li>
<li>Agar lease expire ho jaaye, to client ko address use karna band karna padta hai aur DORA dobara shuru karna padta hai.</li>
<li>Jab user theek se shutdown karta hai ya <code>ipconfig /release</code> chalata hai, client <b>Release</b> bhejta hai taaki address jaldi pool mein wapas aa jaaye.</li>
</ul>
<p>Doosre messages jo pehchaanne chahiye: <b>Decline</b> (client ne dekha ki offered address pehle se use mein hai, aam taur par ARP se pata chalta hai), <b>NAK</b> (server request mana karta hai, jaise client ke doosre subnet mein move hone ke baad), aur <b>Inform</b> (client ke paas pehle se address hai aur use sirf DNS jaise options chahiye).</p>

<div class="eg"><p><b>Worked example.</b> PC1 ko Monday subah 09:00 baje 1 din (24 ghante) ki lease ke saath <code>192.168.10.21</code> milta hai. T1 24 ghante ka 50% = 12 ghante hai, to raat 21:00 baje PC1 192.168.10.1 ko unicast Request bhejta hai aur lease dobara shuru hoti hai. Agar R1 band hota, to PC1 address use karta rehta aur dobara try karta; T2 par (24 ka 87.5% = 21 ghante, yaani Tuesday subah 06:00) woh kisi bhi server ko broadcast karta. Agar Tuesday 09:00 tak koi jawab na deta, to PC1 address kho deta.</p></div>

<h3>Jab koi server jawab na de: APIPA</h3>
<p>Agar Windows, macOS ya Linux client Discovers bhejta hai aur kuch nahi milta, to woh khud ko <code>169.254.0.0/16</code> se address de deta hai. Ise <b>APIPA</b> (Automatic Private IP Addressing) ya IPv4 link-local kehte hain. Isse same cable par do hosts baat kar sakte hain, lekin gateway nahi hota, to subnet ke bahar kuch nahi chalta. <code>169.254.x.x</code> dikhna sabse saaf nishaani hai ki DHCP fail hua.</p>

<h3>Lab mein client kya dekhta hai</h3>
<p>Lab PCs ek simple console use karte hain. <code>ip dhcp</code> DORA chalata hai aur har message ka ek letter print karta hai; <code>show ip</code> result dikhata hai.</p>
<pre class="out">PC1&gt; ip dhcp
<span class="hl">DDORA IP 192.168.10.21/24 GW 192.168.10.1</span>

PC1&gt; show ip
NAME        : PC1[1]
IP/MASK     : 192.168.10.21/24
GATEWAY     : 192.168.10.1
DNS         : 192.168.10.1
DHCP SERVER : 192.168.10.1
MAC         : 00:50:79:66:68:01
MTU         : 1500</pre>
<p>Agar koi server jawab na de, to console <code>DDD</code> ke baad <code>Can't find dhcp server</code> print karta hai: teen Discovers, koi Offer nahi.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki client Offer dekhte hi address use karne lagta hai. Aisa nahi hai. Address sirf Acknowledge ke baad configure hota hai. Ek aur galti: ports mix karna. <b>Server</b> UDP 67 par sunta hai aur <b>client</b> UDP 68 par.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Client sabse pehle kaunsa message bhejta hai?" Discover. "Client renew karne ki koshish kab karta hai?" Lease ke 50% par (T1). 169.254 address matlab APIPA: client DHCP server tak nahi pahunch paya. Iska matlab yeh nahi ki server ne galat address diya.</p></div>

<div class="scn"><h4>Laptops desk par chalte hain lekin meeting room mein nahi</h4><p>Users ne complain kiya ki unke laptops subah bhar desk par chale, lekin jab woh naye meeting room mein gaye aur plug in kiya, to network ek minute "atak" gaya aur phir 169.254 addresses dikhe. Engineer ne meeting room port par traffic capture kiya: Discovers laptop se nikal rahe the, lekin koi Offer wapas nahi aaya. Meeting room port ek naye VLAN mein daala gaya tha jahan na DHCP server tha na relay. Port ko staff VLAN mein move karne se (ya naye VLAN ke liye relay add karne se) theek ho gaya.</p><p><b>Seekh:</b> Discover broadcast hai; yeh sirf same VLAN ke servers tak pahunchta hai jab tak koi relay use forward na kare.</p></div>

<div class="iv"><p class="q">"Jab laptop network join karta hai aur address maangta hai to kya hota hai, step by step batao."</p><p>Strong answer: DORA direction aur addressing ke saath batao: 0.0.0.0:68 se 255.255.255.255:67 par Discover broadcast, server se IP aur options ke saath Offer, Request broadcast taaki doosre servers withdraw karein, Acknowledge se binding confirm. Phir lease lifecycle jodo: 50% (T1) par unicast se renewal, 87.5% (T2) par broadcast se rebinding, aur koi jawab na de to APIPA 169.254/16. T1/T2 batana aapko un candidates se alag karta hai jinhone sirf DORA ratta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DORA: Discover, Offer, Request, Acknowledge. Discover aur Request broadcasts hain.</li>
<li>DHCP UDP 67 (server) aur UDP 68 (client) use karta hai.</li>
<li>50% par renew (T1, unicast), 87.5% par rebind (T2, broadcast), expiry ke baad DORA dobara.</li>
<li>Release, Decline, NAK aur Inform baaki messages hain jo pehchaanne chahiye.</li>
<li>169.254.x.x (APIPA) address matlab kisi DHCP server ne jawab nahi diya.</li>
</ul></div>
`}};export{e as default};