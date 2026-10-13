var e={id:`configure-subinterfaces`,h:{en:`Configuring Layer 3 subinterfaces`,hi:`Layer 3 subinterfaces configure karna`},body:{en:`
<p><b>Analogy: building flats in a tower.</b> The tower (physical port) has one entrance. Each flat (subinterface) needs a flat number (tag), a postal address (IP), and a colony rule book (zone). If any of these is missing, mail does not arrive. The configuration below creates two flats on ethernet1/2 and then checks that the building register lists them correctly.</p>

<h3>The target design</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Physical port</td><td>ethernet1/2 (Layer 3, no IP on the parent)</td></tr>
<tr><td>Users subinterface</td><td>ethernet1/2.10, tag 10, 10.10.10.1/24, zone users</td></tr>
<tr><td>Servers subinterface</td><td>ethernet1/2.20, tag 20, 10.10.20.1/24, zone servers</td></tr>
<tr><td>Uplink</td><td>ethernet1/1, 203.0.113.2/30, zone untrust</td></tr>
<tr><td>Router</td><td>default virtual router holds all three interfaces</td></tr></table>
<p>The addresses are private ranges and documentation ranges, as everywhere in this academy.</p>

<h3>Step 1: the tag is mandatory</h3>
<p>A first attempt creates the subinterface with an IP but no tag. The commit refuses it:</p>
<pre class="out">admin@NK-PA# set network interface ethernet ethernet1/1 layer3 ip 203.0.113.2/30
admin@NK-PA# set network interface ethernet ethernet1/2 layer3 units ethernet1/2.10 ip 10.10.10.1/24
admin@NK-PA# commit

Validation Error:
 <span class="hl">network -&gt; interface -&gt; ethernet -&gt; ethernet1/2 -&gt; layer3 -&gt; units -&gt; ethernet1/2.10 tag is missing</span>
Commit failed</pre>
<p>In the CLI the subinterfaces live under <code>layer3 units</code>. A unit has a name, a tag and an IP. Add the tag, then both subinterfaces:</p>
<pre class="code"><span class="c"># management profile for ping on the new gateways</span>
set network profiles interface-management-profile allow-ping ping yes
<span class="c"># uplink</span>
set network interface ethernet ethernet1/1 layer3 ip 203.0.113.2/30
<span class="c"># two tagged subinterfaces on one physical port</span>
set network interface ethernet ethernet1/2 layer3 units ethernet1/2.10 tag 10 ip 10.10.10.1/24 interface-management-profile allow-ping
set network interface ethernet ethernet1/2 layer3 units ethernet1/2.20 tag 20 ip 10.10.20.1/24 interface-management-profile allow-ping
<span class="c"># virtual router and zones: note the subinterface names, not the parent</span>
set network virtual-router default interface [ ethernet1/1 ethernet1/2.10 ethernet1/2.20 ]
set zone untrust network layer3 ethernet1/1
set zone users network layer3 ethernet1/2.10
set zone servers network layer3 ethernet1/2.20
commit</pre>
<p>Watch the last three groups. The <b>virtual router</b> and the <b>zones</b> list the subinterface names (<code>ethernet1/2.10</code>), not the parent port. The parent itself has no IP, no zone and no virtual router in this design.</p>

<h3>Step 2: read the configuration back</h3>
<pre class="out">admin@NK-PA# show network interface
interface {
  ethernet {
    ethernet1/1 {
      layer3 {
        ip {
          203.0.113.2/30;
        }
      }
    }
    ethernet1/2 {
      layer3 {
        units {
          ethernet1/2.10 {
            tag 10;
            ip {
              10.10.10.1/24;
            }
            interface-management-profile allow-ping;
          }
          ethernet1/2.20 {
            tag 20;
            ip {
              10.10.20.1/24;
            }
            interface-management-profile allow-ping;
          }
        }
      }
    }
  }
}</pre>

<h3>Step 3: verify the logical interface table</h3>
<pre class="out">admin@NK-PA&gt; show interface all
total configured logical interfaces: 4

name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/1         16    1    untrust          vr:default               0      203.0.113.2/30
ethernet1/2         17    1    <span class="hl">N/A              N/A</span>                      0      N/A
ethernet1/2.10      18    1    users            vr:default               <span class="hl">10</span>     10.10.10.1/24
ethernet1/2.20      19    1    N/A              vr:default               <span class="hl">20</span>     10.10.20.1/24</pre>
<p>Read the table like a register. The parent ethernet1/2 has zone N/A and address N/A, as designed (it is just the cable). The <b>tag</b> column shows 10 and 20. In this capture ethernet1/2.20 still has zone N/A because the zone servers was not yet created: precisely the kind of gap you look for. After the zone was added the row showed <code>servers</code>.</p>
<p>The routing table now has a connected route for each subnet, and the egress interface is the <b>subinterface</b>:</p>
<pre class="out">admin@NK-PA&gt; show routing route
destination        nexthop        metric flags  interface
10.10.10.0/24      10.10.10.1     0      A C    ethernet1/2.10
10.10.10.1/32      0.0.0.0        0      A H
10.10.20.0/24      10.10.20.1     0      A C    ethernet1/2.20
10.10.20.1/32      0.0.0.0        0      A H
203.0.113.0/30     203.0.113.2    0      A C    ethernet1/1
203.0.113.2/32     0.0.0.0        0      A H
total routes shown: 6</pre>
<p>(Column spacing shortened.) A note on a simulator limit: <code>show interface ethernet1/2.10</code> is not supported here, so use <code>show interface all</code> to read subinterface details.</p>

<div class="eg"><p><b>Worked example.</b> You need a third VLAN 30 (printers) 10.10.30.0/24. Three lines: <code>set network interface ethernet ethernet1/2 layer3 units ethernet1/2.30 tag 30 ip 10.10.30.1/24</code>, join <code>ethernet1/2.30</code> to the virtual router, and put it in a new zone printers. Then a rule from users to printers allowing only the print application. The rest of the design is untouched.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the parent port name in the zone or virtual router instead of the subinterface. Forgetting the tag (commit fails) or typing the wrong tag (silently wrong, see chapter 5). Putting an IP on the parent and on a subinterface in the same subnet. Using the same IP on two subinterfaces.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which object holds the IP address of the VLAN gateway?" The subinterface, not the parent. "Where do you put the VLAN tag?" On the subinterface. Zones and virtual routers reference subinterface names.</p></div>

<div class="scn"><h4>The commit that asked for a tag</h4><p>An engineer copied the interface lines from a one-VLAN branch design to a new site and saw "tag is missing" at commit. The old design used an untagged parent with an IP. The new design needed subinterfaces. Adding tag values (matching the switch VLAN IDs) fixed it, and a second look at the zone commands showed that they still named the parent. After renaming the zone members to the subinterfaces, show interface all was clean.</p><p><b>Lesson:</b> validation errors and the interface table together tell you what is left to do.</p></div>

<div class="iv"><p class="q">"How do you configure a VLAN gateway on a Palo Alto firewall?"</p><p>Create a Layer 3 subinterface on the physical port with the VLAN tag and the gateway IP, add the subinterface to a virtual router and a zone, attach a management profile if needed, commit, and verify with show interface all and the connected route. The parent port normally has no IP and no zone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subinterfaces live under layer3 units and need a tag (1 to 4094).</li>
<li>Each subinterface has its own IP, zone and virtual router membership.</li>
<li>Zones and virtual routers reference the subinterface name, not the parent.</li>
<li>show interface all shows the tag column and any N/A gaps.</li>
<li>The parent port can stay without IP and zone.</li>
</ul></div>
`,hi:`
<p><b>Analogy: tower mein flats banana.</b> Tower (physical port) ka ek hi entrance hai. Har flat (subinterface) ko flat number (tag), postal address (IP) aur colony ki rule book (zone) chahiye. Inme se kuch missing ho to mail nahi pahunchti. Neeche ki configuration ethernet1/2 par do flats banati hai aur phir check karti hai ki building register unhe sahi list karta hai.</p>

<h3>Target design</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Physical port</td><td>ethernet1/2 (Layer 3, parent par IP nahi)</td></tr>
<tr><td>Users subinterface</td><td>ethernet1/2.10, tag 10, 10.10.10.1/24, zone users</td></tr>
<tr><td>Servers subinterface</td><td>ethernet1/2.20, tag 20, 10.10.20.1/24, zone servers</td></tr>
<tr><td>Uplink</td><td>ethernet1/1, 203.0.113.2/30, zone untrust</td></tr>
<tr><td>Router</td><td>default virtual router mein teeno interfaces</td></tr></table>
<p>Addresses private ranges aur documentation ranges hain, jaise is academy mein har jagah.</p>

<h3>Step 1: tag zaroori hai</h3>
<p>Pehli koshish mein subinterface IP ke saath banta hai lekin tag nahi. Commit use refuse karta hai:</p>
<pre class="out">admin@NK-PA# set network interface ethernet ethernet1/1 layer3 ip 203.0.113.2/30
admin@NK-PA# set network interface ethernet ethernet1/2 layer3 units ethernet1/2.10 ip 10.10.10.1/24
admin@NK-PA# commit

Validation Error:
 <span class="hl">network -&gt; interface -&gt; ethernet -&gt; ethernet1/2 -&gt; layer3 -&gt; units -&gt; ethernet1/2.10 tag is missing</span>
Commit failed</pre>
<p>CLI mein subinterfaces <code>layer3 units</code> ke neeche rehte hain. Unit ka naam, tag aur IP hota hai. Tag jodo, phir dono subinterfaces:</p>
<pre class="code"><span class="c"># naye gateways par ping ke liye management profile</span>
set network profiles interface-management-profile allow-ping ping yes
<span class="c"># uplink</span>
set network interface ethernet ethernet1/1 layer3 ip 203.0.113.2/30
<span class="c"># ek physical port par do tagged subinterfaces</span>
set network interface ethernet ethernet1/2 layer3 units ethernet1/2.10 tag 10 ip 10.10.10.1/24 interface-management-profile allow-ping
set network interface ethernet ethernet1/2 layer3 units ethernet1/2.20 tag 20 ip 10.10.20.1/24 interface-management-profile allow-ping
<span class="c"># virtual router aur zones: subinterface ke naam dhyan se, parent ka nahi</span>
set network virtual-router default interface [ ethernet1/1 ethernet1/2.10 ethernet1/2.20 ]
set zone untrust network layer3 ethernet1/1
set zone users network layer3 ethernet1/2.10
set zone servers network layer3 ethernet1/2.20
commit</pre>
<p>Aakhri teen groups dekho. <b>Virtual router</b> aur <b>zones</b> subinterface ke naam (<code>ethernet1/2.10</code>) list karte hain, parent port ka nahi. Is design mein parent ka khud ka na IP hai, na zone, na virtual router.</p>

<h3>Step 2: configuration wapas padho</h3>
<pre class="out">admin@NK-PA# show network interface
interface {
  ethernet {
    ethernet1/1 {
      layer3 {
        ip {
          203.0.113.2/30;
        }
      }
    }
    ethernet1/2 {
      layer3 {
        units {
          ethernet1/2.10 {
            tag 10;
            ip {
              10.10.10.1/24;
            }
            interface-management-profile allow-ping;
          }
          ethernet1/2.20 {
            tag 20;
            ip {
              10.10.20.1/24;
            }
            interface-management-profile allow-ping;
          }
        }
      }
    }
  }
}</pre>

<h3>Step 3: logical interface table verify karo</h3>
<pre class="out">admin@NK-PA&gt; show interface all
total configured logical interfaces: 4

name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/1         16    1    untrust          vr:default               0      203.0.113.2/30
ethernet1/2         17    1    <span class="hl">N/A              N/A</span>                      0      N/A
ethernet1/2.10      18    1    users            vr:default               <span class="hl">10</span>     10.10.10.1/24
ethernet1/2.20      19    1    N/A              vr:default               <span class="hl">20</span>     10.10.20.1/24</pre>
<p>Table ko register ki tarah padho. Parent ethernet1/2 ka zone N/A aur address N/A hai, jaisa design mein tha (woh sirf cable hai). <b>Tag</b> column 10 aur 20 dikhata hai. Is capture mein ethernet1/2.20 ka zone abhi bhi N/A hai kyunki zone servers abhi bana nahi tha: bilkul wahi gap jo aap dhoondhte ho. Zone jodne ke baad row mein <code>servers</code> dikha.</p>
<p>Routing table mein ab har subnet ka connected route hai, aur egress interface <b>subinterface</b> hai:</p>
<pre class="out">admin@NK-PA&gt; show routing route
destination        nexthop        metric flags  interface
10.10.10.0/24      10.10.10.1     0      A C    ethernet1/2.10
10.10.10.1/32      0.0.0.0        0      A H
10.10.20.0/24      10.10.20.1     0      A C    ethernet1/2.20
10.10.20.1/32      0.0.0.0        0      A H
203.0.113.0/30     203.0.113.2    0      A C    ethernet1/1
203.0.113.2/32     0.0.0.0        0      A H
total routes shown: 6</pre>
<p>(Column spacing chhoti ki gayi hai.) Simulator ki ek limit: yahan <code>show interface ethernet1/2.10</code> supported nahi, isliye subinterface details padhne ke liye <code>show interface all</code> use karo.</p>

<div class="eg"><p><b>Worked example.</b> Aapko teesri VLAN 30 (printers) 10.10.30.0/24 chahiye. Teen lines: <code>set network interface ethernet ethernet1/2 layer3 units ethernet1/2.30 tag 30 ip 10.10.30.1/24</code>, <code>ethernet1/2.30</code> ko virtual router mein jodo, aur use naye zone printers mein daalo. Phir users se printers ka rule jo sirf print application allow kare. Design ka baaki hissa untouched.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Zone ya virtual router mein subinterface ki jagah parent port ka naam daalna. Tag bhool jaana (commit fail) ya galat tag type karna (chupchaap galat, chapter 5 dekho). Parent par aur subinterface par same subnet ka IP daalna. Do subinterfaces par same IP.</p></div>
<div class="exam"><p><b>Exam trap.</b> "VLAN gateway ka IP address kaunsa object rakhta hai?" Subinterface, parent nahi. "VLAN tag kahan lagta hai?" Subinterface par. Zones aur virtual routers subinterface ke naam refer karte hain.</p></div>

<div class="scn"><h4>Commit jisne tag maanga</h4><p>Ek engineer ne ek-VLAN branch design ki interface lines naye site par copy ki aur commit par "tag is missing" dekha. Purane design mein untagged parent par IP tha. Naye design ko subinterfaces chahiye the. Tag values jodne (switch VLAN IDs se match) se fix hua, aur zone commands dobara dekhne par pata chala ki woh ab bhi parent ka naam le rahe the. Zone members ko subinterfaces se badalne ke baad show interface all saaf tha.</p><p><b>Lesson:</b> validation errors aur interface table saath mein batate hain ki kya baaki hai.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall par VLAN gateway kaise configure karte ho?"</p><p>Physical port par VLAN tag aur gateway IP ke saath Layer 3 subinterface banao, subinterface ko virtual router aur zone mein jodo, zaroorat ho to management profile attach karo, commit karo, aur show interface all tatha connected route se verify karo. Parent port par aam taur par na IP hota hai na zone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subinterfaces layer3 units ke neeche rehte hain aur unhe tag (1 se 4094) chahiye.</li>
<li>Har subinterface ka apna IP, zone aur virtual router membership hota hai.</li>
<li>Zones aur virtual routers subinterface ka naam refer karte hain, parent ka nahi.</li>
<li>show interface all tag column aur N/A gaps dikhata hai.</li>
<li>Parent port bina IP aur zone ke reh sakta hai.</li>
</ul></div>
`}};export{e as default};