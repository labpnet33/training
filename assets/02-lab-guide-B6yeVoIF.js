var e={id:`ise-coa-lab-guide`,h:{en:`Lab walkthroughs and acceptance checks`,hi:`Lab walkthroughs aur acceptance checks`},body:{en:`<p>These exercises use the same six-device topology. ACCESS is the network access device, ISE is the CONFIG policy server, and STAFF, PRINTER and UNKNOWN represent three endpoint cases. APP is the protected service. Open each lab from this module to practise its specific fault and assessment.</p><h3>Enable trusted reauthorization</h3><p>Allow CoA from ISE 10.99.99.10 with ConfigCoA26, then reauthenticate STAFF through the ISE helper. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Trust the intended CoA client.</li><li>Apply a CoA reauthentication and verify the resulting session.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ACCESS:
enable
configure terminal
aaa server radius dynamic-author
client 10.99.99.10 server-key ConfigCoA26
end

ISE:
aaa-server coa 10.99.99.1 0050.7966.0201 reauth key ConfigCoA26

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Ticket: authentication works but CoA fails</h3><p>RADIUS authentication uses the correct key, but the NAS dynamic-authorization client has the wrong key. Repair only the CoA trust. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Correct the dynamic-authorization key.</li><li>Verify accepted reauthentication and retained staff access.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ACCESS:
enable
configure terminal
aaa server radius dynamic-author
client 10.99.99.10 server-key ConfigCoA26
end

ISE:
aaa-server coa 10.99.99.1 0050.7966.0201 reauth key ConfigCoA26

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Move an endpoint into quarantine</h3><p>A supplied incident decision requires STAFF in VLAN 90. Set its lab profile, send CoA, then change its lab IP to 10.90.90.10/24 via 10.90.90.1. Prove quarantine gateway access and APP denial. No endpoint posture agent is simulated. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Apply quarantine authorization through CoA.</li><li>Use a valid quarantine IP while preserving isolation.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server authz priya vlan 90 sgt 90
aaa-server coa 10.99.99.1 0050.7966.0201 reauth key ConfigCoA26

Wait 12 simulated seconds

STAFF:
ip 10.90.90.10/24 10.90.90.1</pre></details><h3>Evidence to keep</h3><p>Record the starting failure, the component changed, the resulting identity/method/VLAN/SGT and the traffic outcome. A denied flow must be accompanied by a useful positive test so a disconnected endpoint cannot masquerade as successful isolation. Use only the supplied lab identities. The server helpers and packet model demonstrate concepts; they do not validate a real ISE GUI, certificate chain, posture agent or production deployment.</p>`,hi:`<p>Exercises same six-device topology use karti hain. ACCESS network access device, ISE CONFIG policy server aur STAFF, PRINTER, UNKNOWN teen endpoint cases hain. APP protected service hai. Specific fault aur assessment practice karne ke liye module se har lab kholo.</p><h3>Trusted reauthorization enable karo</h3><p>ISE 10.99.99.10 se ConfigCoA26 key ke saath CoA allow karo, phir ISE helper se STAFF reauthenticate karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Intended CoA client trust karo.</li><li>CoA reauthentication apply karke resulting session verify karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ACCESS:
enable
configure terminal
aaa server radius dynamic-author
client 10.99.99.10 server-key ConfigCoA26
end

ISE:
aaa-server coa 10.99.99.1 0050.7966.0201 reauth key ConfigCoA26

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Ticket: authentication working, CoA failed</h3><p>RADIUS authentication ki key correct hai lekin NAS dynamic-authorization client ki key wrong hai. Sirf CoA trust repair karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Dynamic-authorization key correct karo.</li><li>Accepted reauthentication aur retained staff access verify karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ACCESS:
enable
configure terminal
aaa server radius dynamic-author
client 10.99.99.10 server-key ConfigCoA26
end

ISE:
aaa-server coa 10.99.99.1 0050.7966.0201 reauth key ConfigCoA26

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Endpoint ko quarantine mein move karo</h3><p>Supplied incident decision ke according STAFF ko VLAN 90 chahiye. Lab profile set karo, CoA bhejo, phir lab IP 10.90.90.10/24 gateway 10.90.90.1 karo. Quarantine gateway access aur APP denial prove karo. Endpoint posture agent simulate nahi hai. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>CoA se quarantine authorization apply karo.</li><li>Isolation preserve karke valid quarantine IP use karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server authz priya vlan 90 sgt 90
aaa-server coa 10.99.99.1 0050.7966.0201 reauth key ConfigCoA26

Wait 12 simulated seconds

STAFF:
ip 10.90.90.10/24 10.90.90.1</pre></details><h3>Evidence record karo</h3><p>Starting failure, changed component, resulting identity/method/VLAN/SGT aur traffic outcome record karo. Denied flow ke saath useful positive test chahiye taaki disconnected endpoint ko successful isolation na maana jaye. Sirf supplied lab identities use karo. Server helpers aur packet model concepts demonstrate karte hain; real ISE GUI, certificate chain, posture agent ya production deployment validate nahi karte.</p>`}};export{e as default};