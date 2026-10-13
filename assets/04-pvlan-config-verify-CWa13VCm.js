var e={id:`pvlan-config-verify`,h:{en:`Configuring a private VLAN across two switches and proving it works`,hi:`Do switches par private VLAN configure karna aur kaam karta hai yeh saabit karna`},body:{en:`
<p>This chapter builds the PVLAN from the pvlan-dmz lab. Two switches, DMZ1 and DMZ2, share one DMZ. The gateway is on a promiscuous port (ge-0/0/0), guests GST1 and GST2 must be isolated, web servers WEB1 and WEB2 form a community, and ge-0/0/10 is the link between the switches. The primary VLAN is DMZ (100), the isolated VLAN GUEST (101) and the community VLAN WEB (102).</p>

<h3>The configuration</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="PVLAN lab">
<rect x="20" y="20" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="70" y="45" text-anchor="middle" class="svg-ink" font-size="12">Gateway .1</text>
<rect x="180" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="235" y="97" text-anchor="middle" class="svg-ink" font-size="14">DMZ1</text><text x="235" y="116" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/0 promiscuous</text>
<rect x="350" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="405" y="97" text-anchor="middle" class="svg-ink" font-size="14">DMZ2</text>
<line x1="290" y1="100" x2="350" y2="100" stroke="#64748b" stroke-width="3"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="10">ge-0/0/10 ISL</text>
<line x1="120" y1="40" x2="190" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="160" width="75" height="36" rx="8" fill="#fecaca"/><text x="187" y="183" text-anchor="middle" class="svg-ink" font-size="12">GST1 .11</text>
<rect x="245" y="160" width="75" height="36" rx="8" fill="#bbf7d0"/><text x="282" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB1 .21</text>
<rect x="350" y="160" width="75" height="36" rx="8" fill="#fecaca"/><text x="387" y="183" text-anchor="middle" class="svg-ink" font-size="12">GST2 .12</text>
<rect x="445" y="160" width="75" height="36" rx="8" fill="#bbf7d0"/><text x="482" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB2 .22</text>
<line x1="215" y1="130" x2="187" y2="160" stroke="#64748b" stroke-width="2"/><line x1="250" y1="130" x2="282" y2="160" stroke="#64748b" stroke-width="2"/><line x1="385" y1="130" x2="387" y2="160" stroke="#64748b" stroke-width="2"/><line x1="430" y1="130" x2="482" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Guests are isolated, the two web servers share a community, the ISL joins the two switches.</p></div>
<p>The same lines go on both switches. The VLAN definitions tie the three VLANs together; the port memberships place hosts in their secondary VLANs; one statement makes the trunk an inter-switch link.</p>
<pre class="code">set vlans DMZ vlan-id 100
set vlans DMZ isolated-vlan GUEST
set vlans DMZ community-vlans WEB
set vlans GUEST vlan-id 101 private-vlan isolated
set vlans WEB vlan-id 102 private-vlan community
set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members GUEST
set interfaces ge-0/0/2 unit 0 family ethernet-switching vlan members WEB
set interfaces ge-0/0/10 unit 0 family ethernet-switching inter-switch-link</pre>
<p>The lab already had ge-0/0/1 and ge-0/0/2 in the primary VLAN DMZ, so the solution also deletes those memberships. The configuration that results on DMZ1:</p>
<pre class="out">lab@DMZ1&gt; show configuration vlans
DMZ {
    vlan-id 100;
    isolated-vlan GUEST;
    community-vlans WEB;
}
GUEST {
    vlan-id 101;
    private-vlan isolated;
}
WEB {
    vlan-id 102;
    private-vlan community;
}
lab@DMZ1&gt; show configuration interfaces ge-0/0/0
unit 0 {
    family ethernet-switching {
        vlan {
            members DMZ;
        }
    }
}
lab@DMZ1&gt; show configuration interfaces ge-0/0/10
unit 0 {
    family ethernet-switching {
        interface-mode trunk;
        vlan {
            members DMZ;
        }
        inter-switch-link;
    }
}</pre>
<p>Notice that the promiscuous port is simply an access port in the <b>primary</b> VLAN. Host ports are in secondary VLANs. The ISL is a trunk with the primary VLAN as a member plus the <code>inter-switch-link</code> statement; the secondary VLANs travel over it as well.</p>

<h3>Verifying the VLAN roles</h3>
<pre class="out">lab@DMZ1&gt; show vlans extensive
VLAN Name: DMZ                           State: Active
Tag: 100
Private VLAN mode: Primary
  Isolated VLAN: GUEST (101)
  Community VLANs: WEB (102)
Number of interfaces: 4 (Active = 4)
  Tagged interfaces: ge-0/0/10.0* (inter-switch-link)
  Untagged interfaces: ge-0/0/0.0* (promiscuous), ge-0/0/1.0* (isolated), ge-0/0/2.0* (community)

VLAN Name: GUEST                         State: Active
Tag: 101
Private VLAN mode: Isolated, primary VLAN DMZ (100)
Number of interfaces: 3 (Active = 3)
  Tagged interfaces: ge-0/0/10.0* (inter-switch-link)
  Untagged interfaces: ge-0/0/1.0* (isolated), ge-0/0/0.0* (promiscuous)

VLAN Name: WEB                           State: Active
Tag: 102
Private VLAN mode: Community, primary VLAN DMZ (100)
Number of interfaces: 3 (Active = 3)
  Tagged interfaces: ge-0/0/10.0* (inter-switch-link)
  Untagged interfaces: ge-0/0/2.0* (community), ge-0/0/0.0* (promiscuous)</pre>
<p>This one output tells you the whole design: the roles of each port are labelled, the promiscuous port appears in every secondary VLAN as well, and the ISL is tagged in all three. The interface table shows how each port is configured on DMZ1:</p>
<pre class="out">lab@DMZ1&gt; show ethernet-switching interface
Logical         Vlan                     TAG     MAC     MAC+IP  STP         Logical           Tagging
interface       members                          limit   limit   state       interface flags
ge-0/0/0.0                                       294912  294912                                untagged
                DMZ                      100     294912  294912  Forwarding                    untagged
ge-0/0/1.0                                       294912  294912                                untagged
                GUEST                    101     294912  294912  Forwarding                    untagged
ge-0/0/2.0                                       294912  294912                                untagged
                WEB                      102     294912  294912  Forwarding                    untagged
ge-0/0/10.0                                      294912  294912                                tagged
                DMZ                      100     294912  294912  Forwarding                    tagged</pre>

<h3>Proving the isolation with traffic</h3>
<pre class="out">lab@GST1&gt; ping 10.60.0.1
84 bytes from 10.60.0.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.60.0.1 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.60.0.1 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.60.0.1 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.60.0.1 icmp_seq=5 ttl=64 time=0.900 ms

lab@GST1&gt; ping 10.60.0.12
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable

lab@WEB1&gt; ping 10.60.0.22
84 bytes from 10.60.0.22 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.60.0.22 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.60.0.22 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.60.0.22 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.60.0.22 icmp_seq=5 ttl=64 time=0.900 ms

lab@WEB2&gt; ping 10.60.0.12
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable</pre>
<p>GST1 reaches the gateway but not GST2 on the other switch, so isolation works across the ISL. WEB1 reaches WEB2 across the link (same community). WEB2 cannot reach GST2 (different secondary VLANs). The MAC table shows why:</p>
<pre class="out">lab@DMZ1&gt; show ethernet-switching table
   Vlan                MAC                 MAC         Age    Logical
   name                address             flags              interface
   WEB                 00:50:76:ca:85:01   D           -      ge-0/0/2.0
   DMZ                 00:50:79:ca:8a:01   D           -      ge-0/0/10.0
   GUEST               00:50:f0:ef:04:01   D           -      ge-0/0/1.0
   DMZ                 00:50:f3:ef:08:01   D           -      ge-0/0/10.0
   DMZ                 52:54:02:8d:1e:01   D           -      ge-0/0/0.0</pre>
<p>Local hosts are learned under their secondary VLAN (WEB, GUEST); the gateway and the hosts behind DMZ2 are learned under the primary VLAN DMZ, on ge-0/0/10.0 or ge-0/0/0.0.</p>

<div class="eg"><p><b>Worked example.</b> Adding a third switch DMZ3 with another isolated guest. Define the same three VLANs, put the guest port in GUEST, and mark the uplink to DMZ1 as inter-switch-link. DMZ1 and DMZ2 need no change; the new guest cannot reach GST1 or GST2 because they are all in the one isolated VLAN.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving a host port as a member of the primary VLAN. It then behaves as a promiscuous port and reaches everyone. The second common mistake is forgetting <code>inter-switch-link</code> on one side, so secondary VLAN traffic is not carried and hosts on the far switch lose the gateway.</p></div>
<div class="exam"><p><b>Exam trap.</b> Both switches need the same VLAN IDs and the same private-vlan roles. The primary VLAN is the one with <code>isolated-vlan</code> and <code>community-vlans</code>; the secondary VLANs get <code>private-vlan isolated</code> or <code>private-vlan community</code>. Mixing them up is the usual commit or behaviour error.</p></div>

<div class="scn"><h4>The guest who could see the server</h4><p>After a rebuild, an auditor found that a guest port could ping a web server. show vlans extensive showed that the web server port was a member of the primary VLAN DMZ and was labelled promiscuous, not community. Moving it to WEB restored the policy.</p><p><b>Lesson:</b> read the labels in show vlans extensive. They show how the switch really treats each port.</p></div>

<div class="iv"><p class="q">"How do you extend a private VLAN to a second switch?"</p><p>Create the same primary and secondary VLANs on both, and configure the link between them as an inter-switch link, which carries the primary and all secondary VLANs. Host ports stay in their secondary VLANs and the gateway port stays in the primary. I check show vlans extensive and test with pings between isolated hosts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The primary VLAN lists isolated-vlan and community-vlans; secondary VLANs say private-vlan isolated or community.</li>
<li>Promiscuous port is an access port in the primary VLAN.</li>
<li>Mark the switch-to-switch trunk with inter-switch-link.</li>
<li>show vlans extensive labels every port role and is the first verification command.</li>
</ul></div>
`,hi:`
<p>Yeh chapter pvlan-dmz lab ka PVLAN banata hai. Do switches, DMZ1 aur DMZ2, ek DMZ share karte hain. Gateway promiscuous port (ge-0/0/0) par hai, guests GST1 aur GST2 isolated hone chahiye, web servers WEB1 aur WEB2 ek community banate hain, aur ge-0/0/10 switches ke beech ka link hai. Primary VLAN DMZ (100), isolated VLAN GUEST (101) aur community VLAN WEB (102) hai.</p>

<h3>Configuration</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="PVLAN lab">
<rect x="20" y="20" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="70" y="45" text-anchor="middle" class="svg-ink" font-size="12">Gateway .1</text>
<rect x="180" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="235" y="97" text-anchor="middle" class="svg-ink" font-size="14">DMZ1</text><text x="235" y="116" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/0 promiscuous</text>
<rect x="350" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="405" y="97" text-anchor="middle" class="svg-ink" font-size="14">DMZ2</text>
<line x1="290" y1="100" x2="350" y2="100" stroke="#64748b" stroke-width="3"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="10">ge-0/0/10 ISL</text>
<line x1="120" y1="40" x2="190" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="160" width="75" height="36" rx="8" fill="#fecaca"/><text x="187" y="183" text-anchor="middle" class="svg-ink" font-size="12">GST1 .11</text>
<rect x="245" y="160" width="75" height="36" rx="8" fill="#bbf7d0"/><text x="282" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB1 .21</text>
<rect x="350" y="160" width="75" height="36" rx="8" fill="#fecaca"/><text x="387" y="183" text-anchor="middle" class="svg-ink" font-size="12">GST2 .12</text>
<rect x="445" y="160" width="75" height="36" rx="8" fill="#bbf7d0"/><text x="482" y="183" text-anchor="middle" class="svg-ink" font-size="12">WEB2 .22</text>
<line x1="215" y1="130" x2="187" y2="160" stroke="#64748b" stroke-width="2"/><line x1="250" y1="130" x2="282" y2="160" stroke="#64748b" stroke-width="2"/><line x1="385" y1="130" x2="387" y2="160" stroke="#64748b" stroke-width="2"/><line x1="430" y1="130" x2="482" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Guests isolated hain, do web servers ek community share karte hain, ISL do switches ko jodta hai.</p></div>
<p>Wahi lines dono switches par jaati hain. VLAN definitions teeno VLANs ko jodti hain; port memberships hosts ko unke secondary VLANs mein daalte hain; ek statement trunk ko inter-switch link banata hai.</p>
<pre class="code">set vlans DMZ vlan-id 100
set vlans DMZ isolated-vlan GUEST
set vlans DMZ community-vlans WEB
set vlans GUEST vlan-id 101 private-vlan isolated
set vlans WEB vlan-id 102 private-vlan community
set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members GUEST
set interfaces ge-0/0/2 unit 0 family ethernet-switching vlan members WEB
set interfaces ge-0/0/10 unit 0 family ethernet-switching inter-switch-link</pre>
<p>Lab mein ge-0/0/1 aur ge-0/0/2 pehle se primary VLAN DMZ mein the, isliye solution woh memberships delete bhi karta hai. DMZ1 par nateeja configuration:</p>
<pre class="out">lab@DMZ1&gt; show configuration vlans
DMZ {
    vlan-id 100;
    isolated-vlan GUEST;
    community-vlans WEB;
}
GUEST {
    vlan-id 101;
    private-vlan isolated;
}
WEB {
    vlan-id 102;
    private-vlan community;
}
lab@DMZ1&gt; show configuration interfaces ge-0/0/0
unit 0 {
    family ethernet-switching {
        vlan {
            members DMZ;
        }
    }
}
lab@DMZ1&gt; show configuration interfaces ge-0/0/10
unit 0 {
    family ethernet-switching {
        interface-mode trunk;
        vlan {
            members DMZ;
        }
        inter-switch-link;
    }
}</pre>
<p>Dekho ki promiscuous port bas <b>primary</b> VLAN ka access port hai. Host ports secondary VLANs mein hain. ISL ek trunk hai jisme primary VLAN member hai plus <code>inter-switch-link</code> statement; secondary VLANs bhi isi par chalte hain.</p>

<h3>VLAN roles verify karna</h3>
<pre class="out">lab@DMZ1&gt; show vlans extensive
VLAN Name: DMZ                           State: Active
Tag: 100
Private VLAN mode: Primary
  Isolated VLAN: GUEST (101)
  Community VLANs: WEB (102)
Number of interfaces: 4 (Active = 4)
  Tagged interfaces: ge-0/0/10.0* (inter-switch-link)
  Untagged interfaces: ge-0/0/0.0* (promiscuous), ge-0/0/1.0* (isolated), ge-0/0/2.0* (community)

VLAN Name: GUEST                         State: Active
Tag: 101
Private VLAN mode: Isolated, primary VLAN DMZ (100)
Number of interfaces: 3 (Active = 3)
  Tagged interfaces: ge-0/0/10.0* (inter-switch-link)
  Untagged interfaces: ge-0/0/1.0* (isolated), ge-0/0/0.0* (promiscuous)

VLAN Name: WEB                           State: Active
Tag: 102
Private VLAN mode: Community, primary VLAN DMZ (100)
Number of interfaces: 3 (Active = 3)
  Tagged interfaces: ge-0/0/10.0* (inter-switch-link)
  Untagged interfaces: ge-0/0/2.0* (community), ge-0/0/0.0* (promiscuous)</pre>
<p>Yeh ek output poora design bata deta hai: har port ka role label hai, promiscuous port har secondary VLAN mein bhi dikhta hai, aur ISL teeno mein tagged hai. Interface table dikhata hai DMZ1 par har port kaise configured hai:</p>
<pre class="out">lab@DMZ1&gt; show ethernet-switching interface
Logical         Vlan                     TAG     MAC     MAC+IP  STP         Logical           Tagging
interface       members                          limit   limit   state       interface flags
ge-0/0/0.0                                       294912  294912                                untagged
                DMZ                      100     294912  294912  Forwarding                    untagged
ge-0/0/1.0                                       294912  294912                                untagged
                GUEST                    101     294912  294912  Forwarding                    untagged
ge-0/0/2.0                                       294912  294912                                untagged
                WEB                      102     294912  294912  Forwarding                    untagged
ge-0/0/10.0                                      294912  294912                                tagged
                DMZ                      100     294912  294912  Forwarding                    tagged</pre>

<h3>Traffic se isolation saabit karna</h3>
<pre class="out">lab@GST1&gt; ping 10.60.0.1
84 bytes from 10.60.0.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.60.0.1 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.60.0.1 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.60.0.1 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.60.0.1 icmp_seq=5 ttl=64 time=0.900 ms

lab@GST1&gt; ping 10.60.0.12
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable

lab@WEB1&gt; ping 10.60.0.22
84 bytes from 10.60.0.22 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.60.0.22 icmp_seq=2 ttl=64 time=0.600 ms
84 bytes from 10.60.0.22 icmp_seq=3 ttl=64 time=0.700 ms
84 bytes from 10.60.0.22 icmp_seq=4 ttl=64 time=0.800 ms
84 bytes from 10.60.0.22 icmp_seq=5 ttl=64 time=0.900 ms

lab@WEB2&gt; ping 10.60.0.12
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable</pre>
<p>GST1 gateway tak pahunchta hai par doosre switch ke GST2 tak nahi, matlab isolation ISL ke paar bhi kaam karta hai. WEB1 link ke paar WEB2 tak pahunchta hai (same community). WEB2 GST2 tak nahi pahunch sakta (alag secondary VLANs). MAC table batata hai kyun:</p>
<pre class="out">lab@DMZ1&gt; show ethernet-switching table
   Vlan                MAC                 MAC         Age    Logical
   name                address             flags              interface
   WEB                 00:50:76:ca:85:01   D           -      ge-0/0/2.0
   DMZ                 00:50:79:ca:8a:01   D           -      ge-0/0/10.0
   GUEST               00:50:f0:ef:04:01   D           -      ge-0/0/1.0
   DMZ                 00:50:f3:ef:08:01   D           -      ge-0/0/10.0
   DMZ                 52:54:02:8d:1e:01   D           -      ge-0/0/0.0</pre>
<p>Local hosts apne secondary VLAN (WEB, GUEST) ke under seekhe jaate hain; gateway aur DMZ2 ke peeche ke hosts primary VLAN DMZ ke under, ge-0/0/10.0 ya ge-0/0/0.0 par.</p>

<div class="eg"><p><b>Worked example.</b> Teesra switch DMZ3 jodna jisme ek aur isolated guest hai. Wahi teen VLANs define karo, guest port GUEST mein daalo, aur DMZ1 ki taraf ke uplink ko inter-switch-link mark karo. DMZ1 aur DMZ2 mein koi badlav nahi; naya guest GST1 ya GST2 tak nahi pahunch sakta kyunki sab ek hi isolated VLAN mein hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Host port ko primary VLAN ka member chhod dena. Phir woh promiscuous port ki tarah behave karta hai aur sab tak pahunchta hai. Doosri aam galti: ek side par <code>inter-switch-link</code> bhool jaana, to secondary VLAN traffic carry nahi hota aur door ke switch ke hosts gateway kho dete hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dono switches par same VLAN IDs aur same private-vlan roles chahiye. Primary VLAN woh hai jisme <code>isolated-vlan</code> aur <code>community-vlans</code> hain; secondary VLANs mein <code>private-vlan isolated</code> ya <code>private-vlan community</code> aata hai. Inhe ulat dena aam commit ya behaviour error hai.</p></div>

<div class="scn"><h4>Guest jo server dekh sakta tha</h4><p>Rebuild ke baad auditor ne paaya ki ek guest port web server ko ping kar sakta hai. show vlans extensive ne dikhaya ki web server port primary VLAN DMZ ka member hai aur community nahi, promiscuous label ke saath hai. Use WEB mein le jaane se policy wapas aa gayi.</p><p><b>Lesson:</b> show vlans extensive ke labels padho. Woh dikhate hain ki switch asal mein har port ko kaise treat karta hai.</p></div>

<div class="iv"><p class="q">"Private VLAN ko doosre switch tak kaise badhaoge?"</p><p>Dono par wahi primary aur secondary VLANs banao, aur beech ke link ko inter-switch link configure karo, jo primary aur saare secondary VLANs carry karta hai. Host ports apne secondary VLANs mein rehte hain aur gateway port primary mein. Main show vlans extensive check karta hoon aur isolated hosts ke beech pings se test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Primary VLAN mein isolated-vlan aur community-vlans hote hain; secondary VLANs mein private-vlan isolated ya community.</li>
<li>Promiscuous port primary VLAN ka access port hai.</li>
<li>Switch-to-switch trunk ko inter-switch-link mark karo.</li>
<li>show vlans extensive har port role label karta hai aur pehla verification command hai.</li>
</ul></div>
`}};export{e as default};