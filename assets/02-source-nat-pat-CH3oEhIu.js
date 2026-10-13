var e={id:`source-nat-pat`,h:{en:`Source NAT and PAT on the policy`,hi:`Policy par Source NAT aur PAT`},body:{en:`
<p>When a LAN user opens a website, the packet leaves with a private source such as 10.0.1.10. The internet cannot route back to a private address, so the firewall must replace it. In FortiOS policy-based mode you turn this on with one line in the policy: <code>set nat enable</code>. Think of the receptionist from chapter 1 placing calls from the main number.</p>

<h3>What nat enable does</h3>
<p>With only <code>nat enable</code> and no pool, FortiOS uses the <b>IP address of the egress interface</b> as the new source and also translates the source <b>port</b>, so many hosts can share one address. Translating address and port together is <b>PAT</b> (port address translation), sometimes called NAT overload. The lab policy is the plain form:</p>
<pre class="code">config firewall policy
    edit 1
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end</pre>
<p>Here <code>port1</code> has 203.0.113.2/29, so that is the translated source. Now generate some traffic from PC1 and look at the session table:</p>
<pre class="out">PC1&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms
PC1&gt; curl 8.8.8.8
&lt;html&gt;&lt;body&gt;&lt;h1&gt;INET-SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
icmp    60     10.0.1.10:19499       <span class="hl">203.0.113.2:40001</span>     8.8.8.8:8             -
tcp     3600   10.0.1.10:64251       <span class="hl">203.0.113.2:60001</span>     8.8.8.8:80            -</pre>
<p>Read each line from left to right. The <b>SOURCE</b> column is what the packet looked like when it entered. <b>SOURCE-NAT</b> is what it looks like on the WAN. <b>DESTINATION</b> is the target, and <b>DESTINATION-NAT</b> is a dash because nothing changed the destination. Two lines, one translated address, different translated ports: PAT at work. The ICMP session shows a translated "port" too, because FortiOS uses an identifier for ICMP.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="PAT port table">
<rect x="10" y="20" width="200" height="40" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">10.0.1.10:64251</text>
<rect x="10" y="75" width="200" height="40" rx="8" fill="#bae6fd"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="13">10.0.1.11:51000</text>
<rect x="10" y="130" width="200" height="40" rx="8" fill="#bae6fd"/><text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="13">10.0.1.12:49770</text>
<rect x="240" y="20" width="160" height="150" rx="10" fill="#ddd6fe"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="14">FortiGate</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">one public address</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">many ports</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">session table remembers</text>
<rect x="430" y="20" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2:60001</text>
<rect x="430" y="75" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="100" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2:60002</text>
<rect x="430" y="130" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="155" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2:60003</text>
<line x1="210" y1="40" x2="240" y2="40" stroke="#64748b" stroke-width="2"/><line x1="210" y1="95" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="210" y1="150" x2="240" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="40" x2="430" y2="40" stroke="#64748b" stroke-width="2"/><line x1="400" y1="95" x2="430" y2="95" stroke="#64748b" stroke-width="2"/><line x1="400" y1="150" x2="430" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Illustration of PAT. Three private sockets share one public address by using different ports.</p></div>

<h3>The verbose session: both directions</h3>
<p>The verbose view shows the two hooks, one for each direction of the same session:</p>
<pre class="out">FGT1 # diagnose sys session list
session info: proto=6 proto_state=01 duration=0 expire=3600 timeout=3600 ...
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post dev=4-&gt;3/3-&gt;4 gwy=203.0.113.1/10.0.1.10
hook=post dir=org act=snat 10.0.1.10:64251-&gt;8.8.8.8:80(203.0.113.2:60001)
hook=pre dir=reply act=dnat 8.8.8.8:80-&gt;203.0.113.2:60001(10.0.1.10:64251)
misc=0 policy_id=1 ...</pre>
<ul>
<li><code>hook=post dir=org act=snat</code>: after the routing decision, the original packet gets a new source.</li>
<li><code>hook=pre dir=reply act=dnat</code>: the reply arrives addressed to 203.0.113.2:60001 and is translated back to 10.0.1.10:64251. The reply needs no policy of its own; the session carries it.</li>
<li>The word <b>dnat</b> on the reply is just the reverse of the SNAT. It is not a VIP.</li>
</ul>

<h3>When not to NAT</h3>
<p>NAT belongs on policies that go to a network where your private addresses are not known: the internet. Do <b>not</b> enable it on policies between internal networks that already route to each other (for example LAN to DMZ), or inside a VPN between two sites, because you would lose the original address in logs and break source-based rules at the far end. Use <code>set nat disable</code> (the default) and keep addresses intact.</p>
<pre class="code"><span class="c">! Internal rule: no NAT, original addresses preserved</span>
config firewall policy
    edit 5
        set name "LAN-to-DMZ-WEB"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_NET"
        set dstaddr "WEB-SERVER"
        set action accept
        set schedule "always"
        set service "HTTP" "HTTPS"
        set nat disable
    next
end</pre>

<h3>Related options, in short</h3>
<ul>
<li>An <b>IP pool</b> replaces the egress address with other public addresses (chapter 3).</li>
<li><code>set fixedport enable</code> on a policy keeps the original source port instead of translating it. A few legacy applications need it, but use of fixed ports with a single address allows only one connection per port, so pair it with a pool. This option is described for reference and not run in the simulator.</li>
<li>For connections that start on the internet and target a server, use a VIP (chapters 4 to 6).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pune has 40 users and one public address. At 11:00, 40 users open web pages, and each opens about ten connections. That is around 400 sessions through 203.0.113.2, each with its own translated port. The FortiGate keeps all of them in the session table, and each reply finds its way back because the table maps the translated port to the right PC and port.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Forgetting <code>nat enable</code> so users reach nothing because the internet replies to a private address (the return never arrives); turning NAT on for internal policies; reading DESTINATION-NAT dash as an error (it just means no destination change); assuming that a policy must exist for the reply direction.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default source NAT uses the <i>outgoing interface</i> address. Using another address requires an IP pool. And the translation is stored in the session, so changing the policy does not rewrite sessions that already exist.</p></div>

<div class="scn"><h4>Printer VLAN suddenly "internet-less"</h4><p>A new branch policy for the printer VLAN was cloned from a LAN-to-LAN policy and had <code>nat disable</code>. Printers could reach cloud services in the lab, where the ISP router had a static route back, but not in production. The session table showed sources untranslated at the WAN. Enabling <code>nat enable</code> fixed it immediately.</p><p><b>Lesson:</b> a policy towards the internet needs source NAT, unless the upstream deliberately routes your private range.</p></div>

<div class="iv"><p class="q">"How does a FortiGate let many private hosts share a single public address?"</p><p>With source NAT in PAT mode. <code>nat enable</code> in the policy replaces the source with the egress interface IP and translates the source port, and the session table keeps the mapping so replies are translated back. Mention <code>get system session list</code> as proof and IP pools as the way to use other addresses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>set nat enable</code> turns on source NAT using the egress interface address, with port translation (PAT).</li>
<li>The session table shows SOURCE and SOURCE-NAT; the reply is translated back automatically.</li>
<li>Do not enable NAT between internal networks or inside site-to-site tunnels.</li>
<li>The translation is attached to the session and the policy that created it.</li>
<li>Other public addresses need an IP pool; inbound publishing needs a VIP.</li>
</ul></div>
`,hi:`
<p>LAN user website kholta hai to packet 10.0.1.10 jaise private source ke saath nikalta hai. Internet private address par wapas route nahi kar sakta, isliye firewall ko use badalna padta hai. FortiOS policy-based mode mein aap ise policy mein ek line se on karte ho: <code>set nat enable</code>. Chapter 1 ki receptionist ko socho jo main number se calls lagati hai.</p>

<h3>nat enable kya karta hai</h3>
<p>Sirf <code>nat enable</code> aur pool ke bina FortiOS <b>egress interface ka IP address</b> naye source ke roop mein use karta hai aur source <b>port</b> bhi translate karta hai, taaki kai hosts ek address share kar sakein. Address aur port ko saath translate karna <b>PAT</b> (port address translation) hai, jise kabhi NAT overload bhi kehte hain. Lab policy plain form hai:</p>
<pre class="code">config firewall policy
    edit 1
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end</pre>
<p>Yahan <code>port1</code> ka address 203.0.113.2/29 hai, isliye translated source wahi hai. Ab PC1 se kuch traffic generate karo aur session table dekho:</p>
<pre class="out">PC1&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms
PC1&gt; curl 8.8.8.8
&lt;html&gt;&lt;body&gt;&lt;h1&gt;INET-SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
icmp    60     10.0.1.10:19499       <span class="hl">203.0.113.2:40001</span>     8.8.8.8:8             -
tcp     3600   10.0.1.10:64251       <span class="hl">203.0.113.2:60001</span>     8.8.8.8:80            -</pre>
<p>Har line ko left se right padho. <b>SOURCE</b> column woh hai jo packet enter karte waqt dikhta tha. <b>SOURCE-NAT</b> woh hai jo WAN par dikhta hai. <b>DESTINATION</b> target hai, aur <b>DESTINATION-NAT</b> dash hai kyunki destination kisi ne nahi badla. Do lines, ek translated address, alag translated ports: PAT kaam kar raha hai. ICMP session mein bhi translated "port" dikhta hai, kyunki FortiOS ICMP ke liye ek identifier use karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="PAT port table">
<rect x="10" y="20" width="200" height="40" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">10.0.1.10:64251</text>
<rect x="10" y="75" width="200" height="40" rx="8" fill="#bae6fd"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="13">10.0.1.11:51000</text>
<rect x="10" y="130" width="200" height="40" rx="8" fill="#bae6fd"/><text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="13">10.0.1.12:49770</text>
<rect x="240" y="20" width="160" height="150" rx="10" fill="#ddd6fe"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="14">FortiGate</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">ek public address</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">kai ports</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">session table yaad rakhta hai</text>
<rect x="430" y="20" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2:60001</text>
<rect x="430" y="75" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="100" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2:60002</text>
<rect x="430" y="130" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="155" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.2:60003</text>
<line x1="210" y1="40" x2="240" y2="40" stroke="#64748b" stroke-width="2"/><line x1="210" y1="95" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="210" y1="150" x2="240" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="40" x2="430" y2="40" stroke="#64748b" stroke-width="2"/><line x1="400" y1="95" x2="430" y2="95" stroke="#64748b" stroke-width="2"/><line x1="400" y1="150" x2="430" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">PAT ka illustration. Teen private sockets alag ports se ek public address share karte hain.</p></div>

<h3>Verbose session: dono directions</h3>
<p>Verbose view do hooks dikhata hai, ek hi session ki har direction ke liye ek:</p>
<pre class="out">FGT1 # diagnose sys session list
session info: proto=6 proto_state=01 duration=0 expire=3600 timeout=3600 ...
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post dev=4-&gt;3/3-&gt;4 gwy=203.0.113.1/10.0.1.10
hook=post dir=org act=snat 10.0.1.10:64251-&gt;8.8.8.8:80(203.0.113.2:60001)
hook=pre dir=reply act=dnat 8.8.8.8:80-&gt;203.0.113.2:60001(10.0.1.10:64251)
misc=0 policy_id=1 ...</pre>
<ul>
<li><code>hook=post dir=org act=snat</code>: routing decision ke baad original packet ko naya source milta hai.</li>
<li><code>hook=pre dir=reply act=dnat</code>: reply 203.0.113.2:60001 ke address par aata hai aur wapas 10.0.1.10:64251 mein translate hota hai. Reply ko apni policy nahi chahiye; session use le jaata hai.</li>
<li>Reply par <b>dnat</b> shabd SNAT ka ulta hi hai. Yeh VIP nahi hai.</li>
</ul>

<h3>NAT kab nahi karna</h3>
<p>NAT un policies par lagta hai jo aise network ki taraf jaati hain jahan aapke private addresses jaane nahi jaate: internet. Internal networks ke beech ki policies par (jaise LAN se DMZ), jo already ek doosre ko route karte hain, ya do sites ke VPN ke andar NAT enable <b>mat</b> karo, kyunki aap logs mein original address kho doge aur door wale end par source-based rules tod doge. <code>set nat disable</code> (default) use karo aur addresses intact rakho.</p>
<pre class="code"><span class="c">! Internal rule: no NAT, original addresses preserved</span>
config firewall policy
    edit 5
        set name "LAN-to-DMZ-WEB"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_NET"
        set dstaddr "WEB-SERVER"
        set action accept
        set schedule "always"
        set service "HTTP" "HTTPS"
        set nat disable
    next
end</pre>

<h3>Related options, sankshep mein</h3>
<ul>
<li><b>IP pool</b> egress address ki jagah doosre public addresses lagata hai (chapter 3).</li>
<li>Policy par <code>set fixedport enable</code> source port ko translate karne ki jagah original rakhta hai. Kuch legacy applications ko iski zaroorat hoti hai, lekin ek address ke saath fixed ports se har port par sirf ek connection ho sakta hai, isliye ise pool ke saath jodo. Yeh option reference ke liye hai aur simulator mein run nahi hota.</li>
<li>Internet se shuru hokar server ko target karne wale connections ke liye VIP use karo (chapters 4 se 6).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pune mein 40 users aur ek public address hai. 11:00 baje 40 users web pages kholte hain, aur har ek lagbhag dus connections kholta hai. Yeh 203.0.113.2 se guzarte lagbhag 400 sessions hain, har ek ka apna translated port. FortiGate unhe session table mein rakhta hai, aur har reply apna raasta dhoondh leta hai kyunki table translated port ko sahi PC aur port se map karti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> <code>nat enable</code> bhool jaana, jisse users kuch reach nahi karte kyunki internet private address ko reply karta hai (return kabhi nahi aata); internal policies par NAT on karna; DESTINATION-NAT ke dash ko error samajhna (iska matlab sirf destination change nahi hua); yeh maanna ki reply direction ke liye policy chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default source NAT <i>outgoing interface</i> ka address use karta hai. Doosra address use karne ke liye IP pool chahiye. Aur translation session mein store hoti hai, isliye policy badalne se maujood sessions rewrite nahi hote.</p></div>

<div class="scn"><h4>Printer VLAN achanak "internet-less"</h4><p>Printer VLAN ki nayi branch policy LAN-to-LAN policy se clone hui thi aur usme <code>nat disable</code> tha. Lab mein printers cloud services reach kar pa rahe the, jahan ISP router mein wapas ka static route tha, lekin production mein nahi. Session table ne WAN par untranslated sources dikhaye. <code>nat enable</code> karne se turant theek ho gaya.</p><p><b>Lesson:</b> internet ki taraf ki policy ko source NAT chahiye, jab tak upstream jaanbujhkar aapki private range route na kare.</p></div>

<div class="iv"><p class="q">"FortiGate kai private hosts ko ek public address kaise share karne deta hai?"</p><p>PAT mode mein source NAT se. Policy mein <code>nat enable</code> source ko egress interface IP se replace karta hai aur source port translate karta hai, aur session table mapping rakhti hai taaki replies wapas translate hon. Saboot ke liye <code>get system session list</code> aur doosre addresses ke liye IP pools ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>set nat enable</code> egress interface address se source NAT on karta hai, port translation (PAT) ke saath.</li>
<li>Session table SOURCE aur SOURCE-NAT dikhata hai; reply apne aap wapas translate hota hai.</li>
<li>Internal networks ke beech ya site-to-site tunnels ke andar NAT enable mat karo.</li>
<li>Translation session aur use banane wali policy se juda hota hai.</li>
<li>Doosre public addresses ke liye IP pool chahiye; inbound publishing ke liye VIP.</li>
</ul></div>
`}};export{e as default};