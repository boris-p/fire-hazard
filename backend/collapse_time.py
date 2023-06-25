# This module calculates DHP value as given by Gernay et al
# DHP refer to Duration of Heating Phase that results in failure also known by burnout resistane
# Output of DHP is in minutes
# R referes to Fire Resistance (minutes)
# These are based on Dr Gearny's research and on NIST Publications 1842 and 1681, Woodworks documents on fire ratings
# These are rough estimates and not to be used for actual design or assessement

MATERIALS = ['steel', 'concrete', 'wood', 'masonry', 'other']

def element_failure_DHP(material):
    assert(material in MATERIALS)
    if material == 'concrete':
        R = 4*60 #assumes min 12" columns and 6" slabs & walls
        DHP = 0.72*R-3
    elif material == 'timber':
        R = 1*60 #1 hour taken as more common value for Type V construction
        Lr = 0.2
        if 0.1 < Lr < 0.24:
            DHP = (0.48-(0.25*(Lr-0.1)/0.14))*R
        elif 0.24 <= Lr <=0.4:
            DHP = 0.23*R
        else:
            DHP = 0.5*R
    elif material == 'steel':
        h = 0.5 #in of insulation
        W = 100/12 #lb/in in weight
        D = 40 #40 in perimeter
        c1 = 2.17
        c2 = 50/144
        R = (c1*(W/D)+c2)*h #Wide flange column assued
        DHP = R
    elif material == 'masonry':
        R = 4*60 #assumes min 8" fully grouted CMU wall
        DHP = 0.7*R
    else:
        R = 1*60 #1 hour assumed
        DHP = 0.5*R
    return round(DHP,2)
