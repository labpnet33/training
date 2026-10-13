var e={id:`ios-dns`,h:{en:`DNS on Cisco IOS: domain-lookup, name-server and ip host`,hi:`Cisco IOS par DNS: domain-lookup, name-server aur ip host`},body:{en:`
<p>Routers and switches are hosts too. When you type <code>ping fileserver</code> or <code>ssh -l admin core-sw1</code> on a router, it needs to turn that name into an address just like a laptop does. IOS has its own small DNS client, a local host table, and can even act as a simple DNS server. Every CCNA candidate also meets the most famous IOS DNS annoyance on day one: the typo that freezes the console.</p>

<h3>The typo that freezes the console</h3>
<pre class="out">R1# shwo ip route
<span class="hl">Translating "shwo"...domain server (255.255.255.255)</span>
% Unknown command or computer name, or unable to find computer address</pre>
<p>Why? When IOS does not recognise a word at the exec prompt, it assumes you typed a host name and want to <b>telnet</b> to it. <code>ip domain-lookup</code> is <b>enabled by default</b>, and with no name server configured IOS sends the query to the broadcast address 255.255.255.255 and waits for several seconds for an answer that never comes. There are three fixes, each with a trade-off:</p>
<ul>
<li><code>no ip domain-lookup</code> (newer IOS XE syntax: <code>no ip domain lookup</code>): stops all DNS lookups. Fast, but now <code>ping www.nwk.lab</code> from the router also fails.</li>
<li>Configure a real <code>ip name-server</code>: the typo still triggers a lookup, but it fails quickly with NXDOMAIN.</li>
<li><code>transport preferred none</code> under the console and vty lines: unknown words are no longer treated as telnet attempts, while DNS keeps working for real commands.</li>
</ul>

<h3>Configuring the IOS DNS client</h3>
<pre class="code">R1(config)# ip domain-lookup
R1(config)# ip name-server 10.1.100.53
R1(config)# ip domain-name nwk.lab
<span class="c">! local static entries (no DNS server needed)</span>
R1(config)# ip host SW-CAMPUS 192.168.10.2
R1(config)# ip host R2 10.1.12.2</pre>
<dl class="terms">
<dt><code>ip domain-lookup</code></dt><dd>Enables DNS resolution on the device (default on).</dd>
<dt><code>ip name-server</code></dt><dd>The DNS servers to query, up to six. The router itself uses these; they are <b>not</b> handed to DHCP clients.</dd>
<dt><code>ip domain-name</code></dt><dd>The default domain appended to unqualified names: <code>ping www</code> becomes <code>www.nwk.lab</code>. Also required before generating RSA keys for SSH.</dd>
<dt><code>ip host NAME ADDRESS</code></dt><dd>A static entry in the router's local host table, like a hosts file. Checked before DNS.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Two separate DNS settings on one router">
<rect x="230" y="70" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">DHCP server + DNS client</text>
<rect x="10" y="10" width="190" height="56" rx="10" fill="#bae6fd"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="13">Clients PC1..PC4</text><text x="105" y="54" text-anchor="middle" class="svg-muted" font-size="12">get pool dns-server</text>
<rect x="440" y="10" width="190" height="56" rx="10" fill="#ddd6fe"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="13">DNS 10.1.100.53</text><text x="535" y="54" text-anchor="middle" class="svg-muted" font-size="12">answers queries</text>
<line x1="230" y1="90" x2="200" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="90" x2="440" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="120" y="150" text-anchor="middle" class="svg-accent" font-size="12">pool: dns-server (option 6)</text>
<text x="120" y="170" text-anchor="middle" class="svg-muted" font-size="12">for the clients</text>
<text x="520" y="150" text-anchor="middle" class="svg-accent" font-size="12">global: ip name-server</text>
<text x="520" y="170" text-anchor="middle" class="svg-muted" font-size="12">for the router itself</text>
</svg><p class="cap">Two different settings: one tells clients which DNS server to use, the other is what the router itself uses.</p></div>

<h3>Verification: show hosts</h3>
<pre class="out">R1# show hosts
Default domain is nwk.lab
<span class="hl">Name/address lookup uses domain service
Name servers are 10.1.100.53</span>

Codes: UN - unknown, EX - expired, OK - OK, ?? - revalidate
       temp - temporary, perm - permanent
       NA - Not Applicable None - Not defined

Host                      Port  Flags      Age Type   Address(es)
r2                        None  (perm, OK) 0   IP     10.1.12.2
sw-campus                 None  (perm, OK) 0   IP     192.168.10.2
www.nwk.lab               None  (temp, OK) 0   IP     10.1.100.80</pre>
<p><code>show hosts</code> answers three questions at once: is lookup enabled ("uses domain service" versus "static mappings" after <code>no ip domain-lookup</code>), which name servers are configured (255.255.255.255 means none), and what is in the table. <b>perm</b> entries come from <code>ip host</code>; <b>temp</b> entries were learned from DNS and cached. <code>clear host *</code> empties the dynamic entries.</p>

<pre class="out">R1# ping www.nwk.lab
Translating "www.nwk.lab"...domain server (10.1.100.53) [OK]
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.1.100.80, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</pre>

<h3>The router as a DNS server (briefly)</h3>
<p>IOS can also answer DNS queries with <code>ip dns server</code>, using its <code>ip host</code> table and forwarding other names to its <code>ip name-server</code>. In a tiny branch that avoids a separate server. For the CCNA, know that it exists; enterprise networks use dedicated DNS servers.</p>

<div class="eg"><p><b>Worked example: DHCP vs router DNS.</b> An engineer configures <code>ip name-server 10.1.100.53</code> on R1 and wonders why PCs still cannot resolve names. <code>ipconfig /all</code> on PC1 shows no DNS server. The router setting only affects the router. The clients need <code>dns-server 10.1.100.53</code> inside <code>ip dhcp pool LAN10</code>, then a lease renewal. Both settings point to the same server, but they serve different consumers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Confusing <code>ip name-server</code> (router's own lookups) with <code>dns-server</code> (pool option for clients). Disabling <code>ip domain-lookup</code> and then reporting "DNS is broken" when the router cannot ping a name. Forgetting that <code>ip domain-name</code> is needed for SSH key generation. Typing <code>ip host</code> with a wrong address and forgetting the static entry overrides DNS on that device.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip domain-lookup</code> is on by default; with no server, queries go to 255.255.255.255. <code>ip name-server</code> accepts up to six servers. <code>ip host</code> creates permanent local entries. <code>show hosts</code> verifies all of it.</p></div>

<div class="scn"><h4>The router that could not reach the update server</h4><p>A branch router was set to fetch its configuration backup target by name, and every night the job failed. The log said the host was unknown. <code>show hosts</code> showed "Name/address lookup uses static mappings" and name servers 255.255.255.255: a hardening template had applied <code>no ip domain-lookup</code> to stop console freezes. The engineer re-enabled lookups, added <code>ip name-server 10.1.100.53</code>, and used <code>transport preferred none</code> on the lines to keep typos harmless.</p><p><b>Lesson:</b> fix the typo problem on the lines, not by removing DNS from the device.</p></div>

<div class="iv"><p class="q">"Why does a Cisco router hang when I mistype a command, and how do you fix it properly?"</p><p>An unknown exec word is treated as a host name for telnet, and with domain-lookup on and no name server, IOS broadcasts a DNS query and waits. Quick fix: <code>no ip domain-lookup</code>, but that disables all name resolution on the device. Better: configure a real <code>ip name-server</code> and set <code>transport preferred none</code> on the console and vty lines. Verify with <code>show hosts</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS DNS client: <code>ip domain-lookup</code> (default on), <code>ip name-server</code>, <code>ip domain-name</code>, <code>ip host</code>.</li>
<li>With no name server, lookups go to 255.255.255.255 and typos stall the console.</li>
<li><code>ip name-server</code> is for the router itself; the pool's <code>dns-server</code> is for DHCP clients.</li>
<li><code>show hosts</code> shows lookup mode, name servers and the host table (perm vs temp).</li>
<li><code>ip dns server</code> can make a router answer DNS queries in small sites.</li>
</ul></div>
`,hi:`
<p>Routers aur switches bhi hosts hain. Jab aap router par <code>ping fileserver</code> ya <code>ssh -l admin core-sw1</code> type karte ho, use us naam ko address mein badalna padta hai bilkul laptop ki tarah. IOS ka apna chhota DNS client hai, ek local host table hai, aur yeh ek simple DNS server bhi ban sakta hai. Har CCNA candidate pehle hi din IOS DNS ki sabse famous pareshani se milta hai: woh typo jo console jam kar deta hai.</p>

<h3>Woh typo jo console jam karta hai</h3>
<pre class="out">R1# shwo ip route
<span class="hl">Translating "shwo"...domain server (255.255.255.255)</span>
% Unknown command or computer name, or unable to find computer address</pre>
<p>Kyun? Jab IOS exec prompt par koi shabd nahi pehchanta, woh maan leta hai ki aapne host name type kiya hai aur us par <b>telnet</b> karna chahte ho. <code>ip domain-lookup</code> <b>default mein enabled</b> hai, aur koi name server configured na ho to IOS query broadcast address 255.255.255.255 par bhejta hai aur kai seconds ek aise jawab ka wait karta hai jo kabhi nahi aata. Teen fixes hain, har ek ka trade-off hai:</p>
<ul>
<li><code>no ip domain-lookup</code> (naye IOS XE syntax: <code>no ip domain lookup</code>): saare DNS lookups band. Tez hai, lekin ab router se <code>ping www.nwk.lab</code> bhi fail hota hai.</li>
<li>Asli <code>ip name-server</code> configure karo: typo ab bhi lookup trigger karta hai, lekin NXDOMAIN ke saath jaldi fail hota hai.</li>
<li>Console aur vty lines ke neeche <code>transport preferred none</code>: anjaan shabd ab telnet attempts nahi maane jaate, aur asli commands ke liye DNS chalta rehta hai.</li>
</ul>

<h3>IOS DNS client configure karna</h3>
<pre class="code">R1(config)# ip domain-lookup
R1(config)# ip name-server 10.1.100.53
R1(config)# ip domain-name nwk.lab
<span class="c">! local static entries (DNS server ki zaroorat nahi)</span>
R1(config)# ip host SW-CAMPUS 192.168.10.2
R1(config)# ip host R2 10.1.12.2</pre>
<dl class="terms">
<dt><code>ip domain-lookup</code></dt><dd>Device par DNS resolution enable karta hai (default on).</dd>
<dt><code>ip name-server</code></dt><dd>Query karne wale DNS servers, chhe tak. Router khud inhe use karta hai; yeh DHCP clients ko <b>nahi</b> diye jaate.</dd>
<dt><code>ip domain-name</code></dt><dd>Default domain jo unqualified names ke aage lagta hai: <code>ping www</code> ban jaata hai <code>www.nwk.lab</code>. SSH ke liye RSA keys generate karne se pehle bhi zaroori hai.</dd>
<dt><code>ip host NAME ADDRESS</code></dt><dd>Router ki local host table mein static entry, hosts file jaisi. DNS se pehle check hoti hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ek router par do alag DNS settings">
<rect x="230" y="70" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">DHCP server + DNS client</text>
<rect x="10" y="10" width="190" height="56" rx="10" fill="#bae6fd"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="13">Clients PC1..PC4</text><text x="105" y="54" text-anchor="middle" class="svg-muted" font-size="12">pool ka dns-server milta hai</text>
<rect x="440" y="10" width="190" height="56" rx="10" fill="#ddd6fe"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="13">DNS 10.1.100.53</text><text x="535" y="54" text-anchor="middle" class="svg-muted" font-size="12">queries ka jawab deta hai</text>
<line x1="230" y1="90" x2="200" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="90" x2="440" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="120" y="150" text-anchor="middle" class="svg-accent" font-size="12">pool: dns-server (option 6)</text>
<text x="120" y="170" text-anchor="middle" class="svg-muted" font-size="12">clients ke liye</text>
<text x="520" y="150" text-anchor="middle" class="svg-accent" font-size="12">global: ip name-server</text>
<text x="520" y="170" text-anchor="middle" class="svg-muted" font-size="12">khud router ke liye</text>
</svg><p class="cap">Do alag settings: ek clients ko batati hai kaunsa DNS server use karein, doosri woh hai jo router khud use karta hai.</p></div>

<h3>Verification: show hosts</h3>
<pre class="out">R1# show hosts
Default domain is nwk.lab
<span class="hl">Name/address lookup uses domain service
Name servers are 10.1.100.53</span>

Codes: UN - unknown, EX - expired, OK - OK, ?? - revalidate
       temp - temporary, perm - permanent
       NA - Not Applicable None - Not defined

Host                      Port  Flags      Age Type   Address(es)
r2                        None  (perm, OK) 0   IP     10.1.12.2
sw-campus                 None  (perm, OK) 0   IP     192.168.10.2
www.nwk.lab               None  (temp, OK) 0   IP     10.1.100.80</pre>
<p><code>show hosts</code> ek saath teen sawaalon ka jawab deta hai: lookup enabled hai ya nahi ("uses domain service" versus <code>no ip domain-lookup</code> ke baad "static mappings"), kaunse name servers configured hain (255.255.255.255 ka matlab koi nahi), aur table mein kya hai. <b>perm</b> entries <code>ip host</code> se aati hain; <b>temp</b> entries DNS se seekhi aur cache hui hain. <code>clear host *</code> dynamic entries khaali karta hai.</p>

<pre class="out">R1# ping www.nwk.lab
Translating "www.nwk.lab"...domain server (10.1.100.53) [OK]
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.1.100.80, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</pre>

<h3>Router DNS server ke roop mein (thoda sa)</h3>
<p>IOS <code>ip dns server</code> se DNS queries ka jawab bhi de sakta hai, apni <code>ip host</code> table use karke aur baaki names apne <code>ip name-server</code> ko forward karke. Chhoti branch mein isse alag server ki zaroorat nahi padti. CCNA ke liye itna jaano ki yeh hota hai; enterprise networks dedicated DNS servers use karte hain.</p>

<div class="eg"><p><b>Worked example: DHCP vs router DNS.</b> Ek engineer R1 par <code>ip name-server 10.1.100.53</code> configure karta hai aur sochta hai PCs ab bhi names resolve kyun nahi kar paa rahe. PC1 par <code>ipconfig /all</code> koi DNS server nahi dikhata. Router setting sirf router par asar karti hai. Clients ko <code>ip dhcp pool LAN10</code> ke andar <code>dns-server 10.1.100.53</code> chahiye, phir lease renewal. Dono settings same server ko point karti hain, lekin alag consumers ko serve karti hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>ip name-server</code> (router ke apne lookups) ko <code>dns-server</code> (clients ke liye pool option) se confuse karna. <code>ip domain-lookup</code> disable karke phir report karna "DNS toota hai" jab router naam ping nahi kar paata. Bhool jaana ki SSH key generation ke liye <code>ip domain-name</code> chahiye. <code>ip host</code> galat address ke saath type karna aur bhool jaana ki static entry us device par DNS ko override karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip domain-lookup</code> default mein on hai; server na ho to queries 255.255.255.255 par jaati hain. <code>ip name-server</code> chhe servers tak leta hai. <code>ip host</code> permanent local entries banata hai. <code>show hosts</code> yeh sab verify karta hai.</p></div>

<div class="scn"><h4>Router jo update server tak nahi pahunch paaya</h4><p>Ek branch router apna configuration backup target naam se fetch karne ke liye set tha, aur har raat job fail hota. Log kehta host unknown hai. <code>show hosts</code> ne "Name/address lookup uses static mappings" aur name servers 255.255.255.255 dikhaye: ek hardening template ne console freeze rokne ke liye <code>no ip domain-lookup</code> laga diya tha. Engineer ne lookups dobara enable kiye, <code>ip name-server 10.1.100.53</code> add kiya, aur typos ko harmless rakhne ke liye lines par <code>transport preferred none</code> use kiya.</p><p><b>Seekh:</b> typo problem lines par theek karo, device se DNS hata kar nahi.</p></div>

<div class="iv"><p class="q">"Command galat type karne par Cisco router hang kyun hota hai, aur ise sahi tarike se kaise theek karoge?"</p><p>Anjaan exec shabd ko telnet ke liye host name maana jaata hai, aur domain-lookup on ho aur name server na ho to IOS DNS query broadcast karta hai aur wait karta hai. Quick fix: <code>no ip domain-lookup</code>, lekin isse device par saara name resolution band ho jaata hai. Behtar: asli <code>ip name-server</code> configure karo aur console aur vty lines par <code>transport preferred none</code> set karo. <code>show hosts</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS DNS client: <code>ip domain-lookup</code> (default on), <code>ip name-server</code>, <code>ip domain-name</code>, <code>ip host</code>.</li>
<li>Name server na ho to lookups 255.255.255.255 par jaate hain aur typos console atka dete hain.</li>
<li><code>ip name-server</code> router ke apne liye hai; pool ka <code>dns-server</code> DHCP clients ke liye.</li>
<li><code>show hosts</code> lookup mode, name servers aur host table (perm vs temp) dikhata hai.</li>
<li><code>ip dns server</code> chhoti sites mein router se DNS queries ka jawab dilwa sakta hai.</li>
</ul></div>
`}};export{e as default};