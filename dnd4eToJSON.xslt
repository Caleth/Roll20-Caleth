<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
    <xsl:output method="text" indent="no"/>
    <xsl:strip-space elements="*"/>
    
    <xsl:template name="typeName">
        <xsl:choose>
            <xsl:when test="@type">
                <xsl:value-of select="@type"/>
            </xsl:when>
            <xsl:when test="@String">
                <xsl:value-of select="@String" disable-output-escaping="yes"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:variable name="charelem" select="@charelem"/>
                <xsl:value-of select="ancestor::CharacterSheet/RulesElementTally/*[@charelem=$charelem]/@name"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="statadd[@type or @statlink]">
        <xsl:variable name="typeName">
            <xsl:call-template name="typeName"/>
        </xsl:variable>
        <xsl:variable name="meetsRequires">
            <xsl:choose>
                <xsl:when test="normalize-space($typeName)='1' or normalize-space($typeName)='Ability' or normalize-space($typeName)='SkillRules' or normalize-space($typeName)='trained' or normalize-space($typeName)='Defensive'">
                    <xsl:value-of select="false()"/>
                </xsl:when>
                <xsl:when test="substring(@requires,1,1)='!'">
                    <xsl:variable name="require" select="substring(@requires,2)"/>
                    <xsl:value-of select="count(ancestor::CharacterSheet/RulesElementTally/*[@name=$require])=0"/>
                </xsl:when>
                <xsl:when test="@requires">
                    <xsl:variable name="require" select="@requires"/>
                    <xsl:value-of select="count(ancestor::CharacterSheet/RulesElementTally/*[@name=$require])!=0"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="true()"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:if test="$meetsRequires='true'">,
            <xsl:choose>
                <xsl:when test="not(@statlink)">
                    "<xsl:value-of select="$typeName"/>":
                    <xsl:value-of select="@value"/>
                </xsl:when>
                <xsl:when test="not(@abilmod)">
                    <xsl:variable name="name" select="@statlink"/>
                    "<xsl:value-of select="$typeName"/>":
                    <xsl:value-of select="ancestor::StatBlock/*[alias/@name=$name]/@value"/>
                </xsl:when>
                <xsl:when test="@abilmod">
                    <xsl:variable name="name"><xsl:value-of select="@statlink"/> modifier</xsl:variable>
                    "<xsl:value-of select="$typeName"/>":
                    <xsl:value-of select="ancestor::StatBlock/*[alias/@name=$name]/@value"/>
                </xsl:when>
            </xsl:choose>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="/">
        <xsl:for-each select="D20Character/CharacterSheet">
            {"Vitals": {
            <xsl:for-each select="Details/*[not(self::Portrait)]">
                "<xsl:value-of select="name()"/>": 
                "<xsl:value-of select="normalize-space(text())" disable-output-escaping="yes"/>"<xsl:if test="position()!=last()">,</xsl:if>
                
            </xsl:for-each>
            },
            <xsl:for-each select="StatBlock/*/alias[1]">
                <xsl:variable name="adds">
                    <xsl:apply-templates select=".."/>
                </xsl:variable>
                "<xsl:value-of select="@name"/>": <xsl:if test="normalize-space($adds)!=''">{"Total": </xsl:if>
                <xsl:value-of select="../@value"/>
                <xsl:value-of select="$adds" disable-output-escaping="no"/>
                <xsl:if test="normalize-space($adds)!=''">}</xsl:if>,
                
            </xsl:for-each>
            "RulesElements" : {
            <xsl:for-each select="RulesElementTally/*[@type!='Proficiency']">
                <xsl:sort select="@type"/>
                "<xsl:value-of select="position()"/>":{"type" : "<xsl:call-template name="typeName"/>", 
                "name" : "<xsl:value-of select="@name"/>", 
                "shortdescription" : "<xsl:value-of select="normalize-space(specific[@name='Short Description'])"/>"
                }<xsl:if test="position()!=last()">,</xsl:if>
            </xsl:for-each>
            },
            "Loot" : {
            <xsl:variable name="main" select="document('C:/Users/Caleth/AppData/Roaming/CBLoader/combined.dnd40')//RulesElement"/>
            <xsl:for-each select="LootTally/*[@count>0 and count(RulesElement)>1]">
                "<xsl:value-of select="position()"/>":{
                "name" : "<xsl:value-of select="RulesElement[@type='Magic Item']/@name"/>", 
                "count" : <xsl:value-of select="@count"/>,
                "equip" : <xsl:value-of select="@equip-count"/>,
                "elements": {
                <xsl:for-each select="RulesElement">
                    "<xsl:value-of select="position()"/>":{
                    <xsl:variable name="name" select="@name"/>
                    <xsl:variable name="type" select="@type"/>
                    "name" : "<xsl:value-of select="$name"/>", 
                    "type" : "<xsl:value-of select="$type"/>", 
                    <xsl:for-each select="$main[@name=$name and @type=$type]/specific[substring(@name,1,1)!='_' and @name!='count' and @name!='type']">
                        "<xsl:value-of select="@name"/>" : "<xsl:value-of select="normalize-space(text())"/>"
                        <xsl:if test="position()!=last()">,</xsl:if>
                    </xsl:for-each>
                    }<xsl:if test="position()!=last()">,</xsl:if>
                    
                </xsl:for-each>}}<xsl:if test="position()!=last()">,</xsl:if>
            </xsl:for-each><xsl:if test="count(LootTally/*[count(RulesElement)=1])!=0 and count(LootTally/*[count(RulesElement)>1])!=0">,</xsl:if>
            <xsl:for-each select="LootTally/*[@count>0 and count(RulesElement)=1]/RulesElement">
                "a<xsl:value-of select="position()"/>":{
                <xsl:variable name="name" select="@name"/>
                <xsl:variable name="type" select="@type"/>
                "name" : "<xsl:value-of select="$name"/>", 
                "type" : "<xsl:value-of select="$type"/>", 
                "count" : <xsl:value-of select="../@count"/>,
                "equip" : <xsl:value-of select="../@equip-count"/>,
                <xsl:for-each select="$main[@name=$name and @type=$type]/specific[substring(@name,1,1)!='_' and @name!='count' and @name!='type']">
                    "<xsl:value-of select="@name"/>" : "<xsl:value-of select="normalize-space(text())"/>"
                    <xsl:if test="position()!=last()">,</xsl:if>
                </xsl:for-each>
                }<xsl:if test="position()!=last()">,</xsl:if>
            </xsl:for-each>
            },
            "Powers" : {
            <xsl:for-each select="PowerStats/Power[not(child::Weapon)]">
                <xsl:variable name="name" select="@name"/>
                <xsl:variable name="internal-id" select="$main[@type='Power' and @name=$name and child::specific[@name='_AugmentVersions']]/@internal-id" />
                <xsl:variable name="granted-id" select="$main[@type='Power' and @name=$name]/rules/grant[@type='Power']/@name" />
                <xsl:for-each select="$main[@name=$name and @type='Power' and count(child::specific[@name='_AugmentVersions'])=0] | $main[@type='Power' and normalize-space(child::specific[@name='_AugmentParent'])=$internal-id] | $main[@type='Power' and @internal-id=$granted-id]">
                    "<xsl:value-of select="$name"/> <xsl:value-of select="position()"/>":{"Name" : "<xsl:value-of select="@name"/>", 
                    "Flavor" : "<xsl:value-of select="normalize-space(Flavor/text())"/>", 
                    <xsl:for-each select="specific[substring(@name,1,1)!='_' and @name!='Class']">
                        "<xsl:value-of select="@name"/>" : "<xsl:value-of select="normalize-space(text())"/>"
                        <xsl:if test="position()!=last()">,</xsl:if>
                    </xsl:for-each>},
                </xsl:for-each>
            </xsl:for-each>
            <xsl:for-each select="PowerStats/Power/Weapon[not(@name='Unarmed' and count(preceding-sibling::Weapon)>0) and ancestor::CharacterSheet/*/loot[@equip-count>0]/RulesElement/@internal-id = child::RulesElement/@internal-id]">
                <xsl:variable name="name" select="../@name"/>
                <xsl:variable name="Weapon" select="." />
                <xsl:variable name="internal-id" select="$main[@type='Power' and @name=$name and child::specific[@name='_AugmentVersions']]/@internal-id" />
                <xsl:variable name="granted-id" select="$main[@type='Power' and @name=$name]/rules/grant[@type='Power']/@name" />
                <xsl:variable name="last" select="position()=last()" />
                <xsl:for-each select="$main[@name=$name and @type='Power' and count(child::specific[@name='_AugmentVersions'])=0] | $main[@type='Power' and normalize-space(child::specific[@name='_AugmentParent'])=$internal-id] | $main[@type='Power' and @internal-id=$granted-id]">
                    "<xsl:value-of select="$name"/> <xsl:value-of select="position()"/>":{"Name" : "<xsl:value-of select="@name"/>", 
                    "Weapon" : "<xsl:value-of select="$Weapon/@name"/>",
                    "Flavor" : "<xsl:value-of select="normalize-space(Flavor/text())"/>", 
                    <xsl:for-each select="specific[substring(@name,1,1)!='_' and @name!='Class']">
                        <xsl:variable name="specific-name">
                            <xsl:value-of select="@name"/>
                        </xsl:variable>
                        <xsl:variable name="specific-count">
                            <xsl:value-of select="count(preceding-sibling::*[normalize-space(@name)=normalize-space($specific-name)])"/>
                        </xsl:variable>
                        "<xsl:value-of select="$specific-name"/><xsl:if test="$specific-count>0"><xsl:value-of select="1+$specific-count"/></xsl:if>" : "<xsl:value-of select="normalize-space(text())"/>", 
                    </xsl:for-each>
                    "AttackBonus" : <xsl:value-of select="normalize-space($Weapon/AttackBonus)"/>, 
                    "vs" : "<xsl:value-of select="normalize-space($Weapon/Defense)"/>", 
                    "Damage" : "<xsl:value-of select="normalize-space($Weapon/Damage)"/>", 
                    "Ability" : "<xsl:value-of select="normalize-space($Weapon/AttackStat)"/>",
                    <xsl:for-each select="$Weapon/RulesElement">
                        <xsl:variable name="elemname" select="@name"/>
                        <xsl:variable name="elemtype" select="@type"/>
                        <xsl:for-each select="$main[@name=$elemname and @type=$elemtype]/specific[@name='Critical' or @name='Property']">
                            "<xsl:value-of select="@name"/>" : "<xsl:value-of select="normalize-space(text())"/>",
                        </xsl:for-each>
                    </xsl:for-each>
                    "HitComponents" : "<xsl:value-of select="normalize-space($Weapon/HitComponents)"/>",
                    "DamageComponents" : "<xsl:value-of select="normalize-space($Weapon/DamageComponents)"/>",
                    "Conditions" : "<xsl:value-of select="normalize-space($Weapon/Conditions)"/>"
                    }<xsl:if test="position()!=last() or $last!='false'">,</xsl:if>
                </xsl:for-each>
            </xsl:for-each>
            },
            "Item Powers" : { 
            <xsl:for-each select="LootTally/*[@count>0]/RulesElement">
                <xsl:variable name="elemname" select="@name"/>
                <xsl:variable name="elemtype" select="@type"/>
                <xsl:variable name="last" select="position()=last()" />
                <xsl:for-each select="$main[@name=$elemname and @type=$elemtype]/specific[@name='Power' and normalize-space(text())!='']">
                    "<xsl:value-of select="$elemname"/>":{"Name" : "<xsl:value-of select="$elemname"/>", 
                    "Text" : "<xsl:value-of select="normalize-space(text())"/>"},
                </xsl:for-each>
            </xsl:for-each>
            } }
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>