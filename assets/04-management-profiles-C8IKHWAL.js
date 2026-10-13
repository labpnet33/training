var e={id:`management-profiles`,h:{en:`Management interface and interface management profiles`,hi:`Management interface aur interface management profiles`},body:{en:`
<p><b>Analogy: the doorbell on each gate.</b> A compound has many gates (data interfaces). Visitors pass through the gates to reach other places, but the security office inside the compound (the firewall itself) answers the doorbell only at the gates where you have installed a bell. An <b>interface management profile</b> is that bell: it lists which services the firewall itself will answer on one interface.</p>

<h3>Two different questions</h3>
<p>Beginners mix up two ideas. Keep them apart:</p>
<table class="cmp"><tr><th>Question</th><th>Answered by</th></tr>
<tr><td>May traffic <b>through</b> the firewall (LAN to internet) pass?</td><td>Security policy between zones</td></tr>
<tr><td>May a user talk <b>to</b> the firewall itself on this interface (ping, SSH, HTTPS)?</td><td>Interface management profile on that interface</td></tr></table>
<p>With no profile attached, a data interface does not answer ping, SSH or the web interface. That is secure by default, and it is exactly why your first ping to a new interface fails.</p>

<h3>The dedicated management interface</h3>
<p>Besides ethernet1/x data interfaces, a firewall has a separate <b>management interface</b> (MGT) on the management plane. A new firewall's MGT usually starts at 192.168.1.1 with netmask 255.255.255.0 and gateway 192.168.1.254 in this simulator's factory state. The simulator reports it:</p>
<pre class="out">admin@PA1&gt; show system info
hostname: PA1
ip-address: 192.168.1.1
netmask: 255.255.255.0
default-gateway: 192.168.1.254
family: vm
model: PA-VM</pre>
<p>The MGT interface has its own routing and is not part of the virtual router. Best practice is to keep it on a protected out-of-band network. Allowing management services on a data interface is a convenience for the labs, but on a real internet-facing interface it is a risk.</p>

<h3>Creating profiles</h3>
<p>The lab uses two profiles: <code>allow-ping</code> (ping only) for the ISP side and <code>mgmt-lan</code> (ping, HTTPS and SSH) for the LAN side.</p>
<pre class="code"><span class="c"># ping only: for the untrust and DMZ interfaces</span>
set network profiles interface-management-profile allow-ping ping yes
<span class="c"># ping plus the web interface and SSH: for the trusted LAN</span>
set network profiles interface-management-profile mgmt-lan ping yes h&#116;tps yes ssh yes
<span class="c"># attach to the interfaces</span>
set network interface ethernet ethernet1/2 layer3 interface-management-profile mgmt-lan
set network interface ethernet ethernet1/1 layer3 interface-management-profile allow-ping
commit</pre>
<p>Other options exist (for example telnet, SNMP, response pages, User-ID service). Enable only what the interface needs. An internet-facing interface should normally have, at most, ping.</p>

<h3>Seeing the effect</h3>
<p>The interface is already in a zone and a virtual router, but has no profile. PC1 pings the firewall, then the profile is attached and committed:</p>
<pre class="out">PC1&gt; ping 10.0.1.1
<span class="hl">10.0.1.1 icmp_seq=1 timeout</span>
10.0.1.1 icmp_seq=2 timeout
...
(after attaching mgmt-lan and committing)
PC1&gt; ping 10.0.1.1
<span class="hl">84 bytes from 10.0.1.1 icmp_seq=1 ttl=64 time=0.500 ms</span>
84 bytes from 10.0.1.1 icmp_seq=2 ttl=64 time=0.600 ms</pre>
<p>The firewall also counted the refused attempts. This is the "management" denial counter, separate from policy denies:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show counter global filter delta yes severity drop
name                                   value     rate  severity  category  aspect    description
flow_policy_deny                       5         0     drop      flow      session   Session setup: denied by policy
<span class="hl">flow_host_service_deny                 5         0     drop      flow      mgmt      Device management session denied</span></pre>
<p>(Here <code>flow_policy_deny</code> also appears because five pings to 8.8.8.8 were sent through the firewall before any rule existed. The two counters tell the two stories apart.) You can also read the profile on an interface:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show interface ethernet1/2
Name: ethernet1/2, ID: 16, 802.1q tag: 0
Operation mode: layer3
Virtual router default
Interface MTU 1500
Interface IP address: 10.0.1.1/24
<span class="hl">Interface management profile: mgmt-lan</span>
Zone: trust, virtual system: vsys1</pre>

<div class="eg"><p><b>Worked example.</b> An engineer wants to SSH to the firewall from the Pune LAN only. He attaches <code>mgmt-lan</code> to ethernet1/2 (LAN) and <code>allow-ping</code> to ethernet1/1 (ISP). From the internet, SSH to 203.0.113.2 is not answered because the ISP-side profile has no SSH. Inside the LAN it works. The same box, two different answers, decided per interface.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing a security rule "trust to trust allow ssh" to allow SSH to the firewall (the profile does that, not policy). Applying a profile with HTTPS to the untrust interface. Mistyping the profile name on the interface, which fails the commit with an invalid reference.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Users cannot ping the firewall's LAN IP, but internet access works. What is missing?" An interface management profile with ping on that interface. A security rule is the wrong answer here, and so is a route.</p></div>

<div class="scn"><h4>The monitoring server that could not ping the firewall</h4><p>A new monitoring system could not reach the firewall's DMZ interface by ping, although the DMZ servers worked fine through the firewall. The interface had no management profile. One profile with ping, one commit, and monitoring went green. Months later a security audit asked why HTTPS was open on the internet-facing interface. It had been copied there by mistake and was removed.</p><p><b>Lesson:</b> allow only the services each interface needs, and review them.</p></div>

<div class="iv"><p class="q">"Where do you permit SSH to the firewall itself, and why is policy not the answer?"</p><p>In an interface management profile attached to the interface the admin connects to, because traffic destined to the firewall's own address is handled by the management services on that interface, not by the through-traffic rulebase. Add that you restrict permitted IPs for management and keep the dedicated management port on an out-of-band network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Through-traffic is controlled by security policy; traffic to the firewall by management profiles.</li>
<li>No profile means no ping, SSH or web answer on that data interface.</li>
<li>Profiles are created under network profiles and attached per interface.</li>
<li>flow_host_service_deny counts refused management traffic.</li>
<li>Keep the MGT port separate and expose only what you need.</li>
</ul></div>
`,hi:`
<p><b>Analogy: har gate par doorbell.</b> Ek compound mein kai gates hain (data interfaces). Visitors gates se doosri jagah jaate hain, lekin compound ke andar ka security office (firewall khud) sirf un gates par doorbell ka jawab deta hai jahan aapne bell lagayi hai. <b>Interface management profile</b> wahi bell hai: yeh list karta hai ki firewall khud ek interface par kaunsi services ka jawab dega.</p>

<h3>Do alag sawal</h3>
<p>Beginners do ideas mix kar dete hain. Unhe alag rakho:</p>
<table class="cmp"><tr><th>Sawal</th><th>Jawab kaun deta hai</th></tr>
<tr><td>Kya firewall <b>ke through</b> traffic (LAN se internet) pass ho sakta hai?</td><td>Zones ke beech security policy</td></tr>
<tr><td>Kya user firewall <b>se khud</b> is interface par baat kar sakta hai (ping, SSH, HTTPS)?</td><td>Us interface ka interface management profile</td></tr></table>
<p>Profile attached na ho to data interface ping, SSH ya web interface ka jawab nahi deta. Yeh by default secure hai, aur isi wajah se naye interface par aapka pehla ping fail hota hai.</p>

<h3>Dedicated management interface</h3>
<p>ethernet1/x data interfaces ke alawa firewall mein alag <b>management interface</b> (MGT) hota hai jo management plane par hai. Naye firewall ka MGT aam taur par 192.168.1.1 par shuru hota hai, is simulator ki factory state mein netmask 255.255.255.0 aur gateway 192.168.1.254 ke saath. Simulator ise report karta hai:</p>
<pre class="out">admin@PA1&gt; show system info
hostname: PA1
ip-address: 192.168.1.1
netmask: 255.255.255.0
default-gateway: 192.168.1.254
family: vm
model: PA-VM</pre>
<p>MGT interface ki apni routing hoti hai aur woh virtual router ka hissa nahi. Best practice hai ki use protected out-of-band network par rakho. Data interface par management services allow karna labs ke liye convenience hai, lekin real internet-facing interface par risk hai.</p>

<h3>Profiles banana</h3>
<p>Lab do profiles use karta hai: ISP side ke liye <code>allow-ping</code> (sirf ping) aur LAN side ke liye <code>mgmt-lan</code> (ping, HTTPS aur SSH).</p>
<pre class="code"><span class="c"># sirf ping: untrust aur DMZ interfaces ke liye</span>
set network profiles interface-management-profile allow-ping ping yes
<span class="c"># ping plus web interface aur SSH: trusted LAN ke liye</span>
set network profiles interface-management-profile mgmt-lan ping yes h&#116;tps yes ssh yes
<span class="c"># interfaces se attach karo</span>
set network interface ethernet ethernet1/2 layer3 interface-management-profile mgmt-lan
set network interface ethernet ethernet1/1 layer3 interface-management-profile allow-ping
commit</pre>
<p>Aur options bhi hain (jaise telnet, SNMP, response pages, User-ID service). Sirf wahi enable karo jo interface ko chahiye. Internet-facing interface par aam taur par zyada se zyada ping hona chahiye.</p>

<h3>Asar dekhna</h3>
<p>Interface pehle se zone aur virtual router mein hai, lekin profile nahi. PC1 firewall ko ping karta hai, phir profile attach karke commit hota hai:</p>
<pre class="out">PC1&gt; ping 10.0.1.1
<span class="hl">10.0.1.1 icmp_seq=1 timeout</span>
10.0.1.1 icmp_seq=2 timeout
...
(mgmt-lan attach karke commit karne ke baad)
PC1&gt; ping 10.0.1.1
<span class="hl">84 bytes from 10.0.1.1 icmp_seq=1 ttl=64 time=0.500 ms</span>
84 bytes from 10.0.1.1 icmp_seq=2 ttl=64 time=0.600 ms</pre>
<p>Firewall ne refuse hui koshishein gin bhi li thi. Yeh "management" denial counter hai, policy denies se alag:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show counter global filter delta yes severity drop
name                                   value     rate  severity  category  aspect    description
flow_policy_deny                       5         0     drop      flow      session   Session setup: denied by policy
<span class="hl">flow_host_service_deny                 5         0     drop      flow      mgmt      Device management session denied</span></pre>
<p>(Yahan <code>flow_policy_deny</code> bhi dikhta hai kyunki koi rule bante se pehle firewall ke through 8.8.8.8 ke paanch pings bheje gaye the. Dono counters do alag kahaniyan batate hain.) Aap interface par profile bhi padh sakte ho:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show interface ethernet1/2
Name: ethernet1/2, ID: 16, 802.1q tag: 0
Operation mode: layer3
Virtual router default
Interface MTU 1500
Interface IP address: 10.0.1.1/24
<span class="hl">Interface management profile: mgmt-lan</span>
Zone: trust, virtual system: vsys1</pre>

<div class="eg"><p><b>Worked example.</b> Ek engineer sirf Pune LAN se firewall par SSH karna chahta hai. Woh <code>mgmt-lan</code> ethernet1/2 (LAN) par aur <code>allow-ping</code> ethernet1/1 (ISP) par attach karta hai. Internet se 203.0.113.2 par SSH ka jawab nahi aata kyunki ISP-side profile mein SSH nahi hai. LAN ke andar kaam karta hai. Wahi box, do alag jawab, interface ke hisaab se tay hote hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Firewall par SSH allow karne ke liye security rule "trust to trust allow ssh" likhna (yeh kaam profile karta hai, policy nahi). Untrust interface par HTTPS wala profile lagana. Interface par profile ka naam galat type karna, jisse commit invalid reference ke saath fail hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Users firewall ke LAN IP ko ping nahi kar pa rahe, lekin internet access chal raha hai. Kya missing hai?" Us interface par ping wala interface management profile. Security rule yahan galat jawab hai, aur route bhi.</p></div>

<div class="scn"><h4>Monitoring server jo firewall ko ping nahi kar paya</h4><p>Naya monitoring system firewall ke DMZ interface ko ping se reach nahi kar pa raha tha, jabki DMZ servers firewall ke through theek chal rahe the. Interface par management profile nahi tha. Ek ping wala profile, ek commit, aur monitoring green ho gaya. Mahinon baad security audit ne poocha ki internet-facing interface par HTTPS kyun khula hai. Woh galti se wahan copy ho gaya tha aur hata diya gaya.</p><p><b>Lesson:</b> har interface ko jo services chahiye sirf wahi allow karo, aur unhe review karo.</p></div>

<div class="iv"><p class="q">"Firewall par khud SSH kahan permit karte ho, aur policy jawab kyun nahi hai?"</p><p>Us interface se attached interface management profile mein jis par admin connect karta hai, kyunki firewall ke apne address ke liye aaya traffic us interface ki management services handle karti hain, through-traffic rulebase nahi. Jodo ki aap management ke liye permitted IPs restrict karte ho aur dedicated management port out-of-band network par rakhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Through-traffic security policy se control hota hai; firewall ka apna traffic management profiles se.</li>
<li>Profile nahi to us data interface par ping, SSH ya web ka jawab nahi.</li>
<li>Profiles network profiles ke neeche banate hain aur interface par attach karte hain.</li>
<li>flow_host_service_deny refuse hua management traffic ginta hai.</li>
<li>MGT port alag rakho aur sirf zaroori cheez expose karo.</li>
</ul></div>
`}};export{e as default};