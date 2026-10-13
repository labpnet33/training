var e={id:`source-nat`,h:{en:`Source NAT: dynamic IP and port for the LAN`,hi:`Source NAT: LAN ke liye dynamic IP and port`},body:{en:`
<p>Source NAT answers the question "how do 200 PCs with private addresses share one public address?". The firewall rewrites the source address of each outbound packet and also the source <b>port</b>, so that returning packets can be matched to the right PC. The technique is called <b>dynamic IP and port</b> (DIPP), or PAT. On PAN-OS it is the default choice for LAN access.</p>
<table class="cmp"><tr><th>Source translation</th><th>What it does</th><th>Use when</th></tr><tr><td><code>dynamic-ip-and-port interface-address</code></td><td>uses the egress interface IP, translates ports</td><td>one public address (the common case)</td></tr><tr><td><code>dynamic-ip-and-port translated-address</code></td><td>a pool of addresses with port translation</td><td>many users, more than one public IP</td></tr><tr><td><code>dynamic-ip</code></td><td>a pool without port translation (one IP per host while in use)</td><td>applications that cannot accept port changes</td></tr><tr><td><code>static-ip</code></td><td>fixed one-to-one mapping</td><td>a host that needs a stable public IP</td></tr></table>
<h3>Configure and prove it</h3>
<p>Create the rule. Zones are <b>trust to untrust</b> (pre-NAT zones), the translation uses the address of <code>ethernet1/1</code>:</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# set rulebase nat rules SNAT-Out from trust to untrust source any destination any service any source-translation dynamic-ip-and-port interface-address interface ethernet1/1
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"SNAT-Out; index: 1" {
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        to-interface  ;
        destination any;
        service any;
<span class="hl">        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}</pre>
<p>Ask the NAT engine what it would do for a LAN client to the internet over TCP 443, before sending any traffic:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test nat-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
SNAT-Out; index: 1 {
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        to-interface  ;
        destination any;
        service any;
<span class="hl">        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}</pre>
<p>The answer is <code>src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)</code>. Now generate traffic and read the session table. The <code>NS</code> flag means source NAT was applied, and the bracket after the arrow shows the translated address and port:</p>
<pre class="out">PC1&gt; ping 8.8.8.8 -c 1
<span class="hl">84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms</span>
PC1&gt; curl 8.8.8.8
<span class="hl">&lt;html&gt;&lt;body&gt;&lt;h1&gt;INET-SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</span></pre>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
9361         web-browsing   ACTIVE  FLOW       10.0.1.10[64251]/trust/6  (10.0.1.10[64251])
vsys1                                          8.8.8.8[80]/untrust  (8.8.8.8[80])
<span class="hl">9362         ping           ACTIVE  FLOW NS    10.0.1.10[19499]/trust/1  (203.0.113.2[40001])</span>
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])
<span class="hl">9363         web-browsing   ACTIVE  FLOW NS    10.0.1.10[57160]/trust/6  (203.0.113.2[60001])</span>
vsys1                                          8.8.8.8[80]/untrust  (8.8.8.8[80])</pre>
<p>Both new sessions carry the flag <b>NS</b> and the translated source is <b>203.0.113.2</b> with a new port (for example 60001). The first session in the list is the old untranslated one from before the rule. Open one session in detail to see both directions and the NAT rule that applied:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9362
Session             9362
	c2s flow:
		source:      10.0.1.10 [trust]
		dst:         8.8.8.8
		sport:       19499           dport:      8
	s2c flow:
		source:      8.8.8.8 [untrust]
<span class="hl">		dst:         203.0.113.2</span>
		sport:       40001           dport:      0
	total byte count(c2s)                : 104
	total byte count(s2c)                : 104
	layer7 packet count(c2s)             : 1
	layer7 packet count(s2c)             : 1
	application                          : ping
	rule                                 : Allow-Out
<span class="hl">	address/port translation             : source</span>
<span class="hl">	nat-rule                             : SNAT-Out(vsys1)</span>
	ingress interface                    : ethernet1/2
	egress interface                     : ethernet1/1
	session QoS rule                     : N/A (class 4)</pre>
<p>The reply direction (<code>s2c flow</code>) is addressed to <b>203.0.113.2</b>, the translated address. The firewall maps that back to 10.0.1.10 using the session. This is why return traffic needs no rule and no NAT: the session remembers everything.</p>
<p>The traffic log confirms both decisions are in place (the security decision shows the rule <code>Allow-Out</code>):</p>
<pre class="out">admin@NK-PUNE-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
                SrcUser         DstUser         End Reason
====================================================================================================
2026/10/02 04:03:56 web-browsing    trust           57160     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         80        8.8.8.8</span>
                                                aged-out

2026/10/02 04:03:56 ping            trust           19499     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         0         8.8.8.8</span>
                                                aged-out

2026/10/02 04:03:56 web-browsing    trust           64251     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         80        8.8.8.8</span>
                                                aged-out</pre>
<div class="eg"><p><b>Worked example.</b> A DIPP address has 65,535 ports but only about 64,000 can be used per protocol, and each session uses one port from the pool for its translated source. With one public address that is a ceiling of tens of thousands of concurrent sessions toward the same destination. For 3,000 users with 20 sessions each (60,000 sessions) to one popular service a single address is tight; add a second public address to a <code>translated-address</code> pool.</p></div>
<div class="warn"><p><b>Common mistake.</b> Writing the source NAT rule with <code>from trust to trust</code> or choosing the wrong interface. The destination zone is the zone of the egress interface, here untrust.</p></div>
<div class="exam"><p><b>Exam trap.</b> The flag <b>NS</b> means source NAT and <b>ND</b> destination NAT, and <b>NB</b> both. Which NAT type lets thousands of users share one public IP? Dynamic IP and port.</p></div>
<div class="scn"><h4>The replies that went nowhere</h4><p>Ten PCs in a new VLAN had no internet while the older VLAN worked. The session table showed the new VLAN's sessions without the NS flag. The existing NAT rule listed an address group that did not include the new subnet. The engineer added the subnet to the group and the next session carried NS with the translated address.</p><p><b>Lesson:</b> check the NS flag per source; a rule that does not match leaves traffic untranslated.</p></div>
<div class="iv"><p class="q">"Explain dynamic IP and port source NAT."</p><p>Many private hosts share one or a few public addresses. The firewall rewrites the source address and the source port, and keeps a session entry mapping the translated tuple back to the private host. On PAN-OS I would use the egress interface address or a small pool, put trust to untrust as the zones, and verify with <code>test nat-policy-match</code>, the NS flag in the session table and the NAT rule shown in <code>show session id</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>DIPP translates both address and port so many hosts share one address.</li><li>NAT zones for source NAT: from trust to untrust (pre-NAT).</li><li>NS flag in <code>show session all</code> means source NAT applied.</li><li>Return traffic needs no extra rule; the session handles it.</li></ul></div>
`,hi:`
<p>Source NAT is sawaal ka jawab hai "private addresses wale 200 PCs ek public address kaise share karein?". Firewall har outbound packet ka source address aur source <b>port</b> bhi badalta hai, taaki laut ke aane wale packets sahi PC se match ho sakein. Is technique ko <b>dynamic IP and port</b> (DIPP), ya PAT kehte hain. PAN-OS par LAN access ke liye yeh default choice hai.</p>
<table class="cmp"><tr><th>Source translation</th><th>Kya karta hai</th><th>Kab use karein</th></tr><tr><td><code>dynamic-ip-and-port interface-address</code></td><td>egress interface IP use karta hai, ports translate karta hai</td><td>ek public address (aam case)</td></tr><tr><td><code>dynamic-ip-and-port translated-address</code></td><td>addresses ka pool, port translation ke saath</td><td>kai users, ek se zyada public IP</td></tr><tr><td><code>dynamic-ip</code></td><td>bina port translation ka pool (use mein ek host ke liye ek IP)</td><td>applications jo port changes accept nahi karte</td></tr><tr><td><code>static-ip</code></td><td>fixed ek-se-ek mapping</td><td>host jise stable public IP chahiye</td></tr></table>
<h3>Configure karo aur saabit karo</h3>
<p>Rule banao. Zones <b>trust to untrust</b> hain (pre-NAT zones), translation <code>ethernet1/1</code> ka address use karti hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# set rulebase nat rules SNAT-Out from trust to untrust source any destination any service any source-translation dynamic-ip-and-port interface-address interface ethernet1/1
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"SNAT-Out; index: 1" {
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        to-interface  ;
        destination any;
        service any;
<span class="hl">        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}</pre>
<p>Traffic bheje bina NAT engine se poochho ki LAN client ke TCP 443 internet traffic par kya karega:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test nat-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
SNAT-Out; index: 1 {
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        to-interface  ;
        destination any;
        service any;
<span class="hl">        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}</pre>
<p>Jawab hai <code>src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)</code>. Ab traffic generate karo aur session table padho. <code>NS</code> flag ka matlab source NAT lagu hua, aur arrow ke baad ka bracket translated address aur port dikhata hai:</p>
<pre class="out">PC1&gt; ping 8.8.8.8 -c 1
<span class="hl">84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms</span>
PC1&gt; curl 8.8.8.8
<span class="hl">&lt;html&gt;&lt;body&gt;&lt;h1&gt;INET-SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</span></pre>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
9361         web-browsing   ACTIVE  FLOW       10.0.1.10[64251]/trust/6  (10.0.1.10[64251])
vsys1                                          8.8.8.8[80]/untrust  (8.8.8.8[80])
<span class="hl">9362         ping           ACTIVE  FLOW NS    10.0.1.10[19499]/trust/1  (203.0.113.2[40001])</span>
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])
<span class="hl">9363         web-browsing   ACTIVE  FLOW NS    10.0.1.10[57160]/trust/6  (203.0.113.2[60001])</span>
vsys1                                          8.8.8.8[80]/untrust  (8.8.8.8[80])</pre>
<p>Dono naye sessions par flag <b>NS</b> hai aur translated source <b>203.0.113.2</b> naye port ke saath (jaise 60001). List ka pehla session NAT rule se pehle ka purana untranslated session hai. Ek session ko detail mein kholo, dono directions aur lagu hui NAT rule dekhne ke liye:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9362
Session             9362
	c2s flow:
		source:      10.0.1.10 [trust]
		dst:         8.8.8.8
		sport:       19499           dport:      8
	s2c flow:
		source:      8.8.8.8 [untrust]
<span class="hl">		dst:         203.0.113.2</span>
		sport:       40001           dport:      0
	total byte count(c2s)                : 104
	total byte count(s2c)                : 104
	layer7 packet count(c2s)             : 1
	layer7 packet count(s2c)             : 1
	application                          : ping
	rule                                 : Allow-Out
<span class="hl">	address/port translation             : source</span>
<span class="hl">	nat-rule                             : SNAT-Out(vsys1)</span>
	ingress interface                    : ethernet1/2
	egress interface                     : ethernet1/1
	session QoS rule                     : N/A (class 4)</pre>
<p>Reply direction (<code>s2c flow</code>) translated address <b>203.0.113.2</b> par addressed hai. Firewall session ke zariye use wapas 10.0.1.10 se map karta hai. Isi liye return traffic ko na rule chahiye na NAT: session sab yaad rakhta hai.</p>
<p>Traffic log confirm karta hai ki dono decisions maujood hain (security decision rule <code>Allow-Out</code> dikhata hai):</p>
<pre class="out">admin@NK-PUNE-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
                SrcUser         DstUser         End Reason
====================================================================================================
2026/10/02 04:03:56 web-browsing    trust           57160     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         80        8.8.8.8</span>
                                                aged-out

2026/10/02 04:03:56 ping            trust           19499     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         0         8.8.8.8</span>
                                                aged-out

2026/10/02 04:03:56 web-browsing    trust           64251     10.0.1.10
<span class="hl">Allow-Out       allow           untrust         80        8.8.8.8</span>
                                                aged-out</pre>
<div class="eg"><p><b>Worked example.</b> Ek DIPP address ke 65,535 ports hote hain lekin per protocol takriban 64,000 hi use ho sakte hain, aur har session translated source ke liye pool se ek port leta hai. Ek public address ke saath yeh ek hi destination ki taraf hazaaron concurrent sessions ki seema hai. Ek popular service par 20 sessions wale 3,000 users (60,000 sessions) ke liye ek address tang hai; <code>translated-address</code> pool mein doosra public address jodo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Source NAT rule <code>from trust to trust</code> likhna ya galat interface chunna. Destination zone egress interface ka zone hai, yahan untrust.</p></div>
<div class="exam"><p><b>Exam trap.</b> Flag <b>NS</b> ka matlab source NAT, <b>ND</b> destination NAT, aur <b>NB</b> dono. Kaunsa NAT type hazaaron users ko ek public IP share karne deta hai? Dynamic IP and port.</p></div>
<div class="scn"><h4>Replies jo kahin nahi gaye</h4><p>Naye VLAN ke das PCs ko internet nahi tha jabki purana VLAN chal raha tha. Session table mein naye VLAN ke sessions bina NS flag ke the. Maujooda NAT rule ek address group list karti thi jisme naya subnet nahi tha. Engineer ne subnet group mein jodha aur agle session par translated address ke saath NS aaya.</p><p><b>Lesson:</b> Source ke hisaab se NS flag check karo; match na karne wali rule traffic ko untranslated chhod deti hai.</p></div>
<div class="iv"><p class="q">"Dynamic IP and port source NAT samjhao."</p><p>Kai private hosts ek ya kuch public addresses share karte hain. Firewall source address aur source port badalta hai, aur session entry rakhta hai jo translated tuple ko private host se map karti hai. PAN-OS par main egress interface address ya chhota pool use karunga, zones trust to untrust, aur <code>test nat-policy-match</code>, session table ka NS flag aur <code>show session id</code> mein dikhne wali NAT rule se verify karunga.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>DIPP address aur port dono translate karta hai taaki kai hosts ek address share karein.</li><li>Source NAT ke zones: from trust to untrust (pre-NAT).</li><li><code>show session all</code> mein NS flag ka matlab source NAT lagu.</li><li>Return traffic ko extra rule nahi chahiye; session sambhal leta hai.</li></ul></div>
`}};export{e as default};