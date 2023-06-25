# This module calculates DHP value as given by Gernay et al
# DHP refer to Duration of Heating Phase that results in failure also known by burnout resistane
# Output of DHP is in minutes
# R referes to Fire Resistance (minutes)

MATERIALS = ['steel', 'concrete', 'wood', 'masonry', 'other']

def structure_failure_potential(column_DHP, system_strength_factor = 1.25):
    structure_failure_potential = round(column_DHP*system_strength_factor,2)
    return structure_failure_potential

def element_failure_DHP(material, R = 60, Lr):

    if material == 'concrete':
        DHP = 0.72*R-3
    elif material == 'timber':
        if 0.1 < Lr < 0.24:
            DHP = (0.48-(0.25*(Lr-0.1)/0.14))*R
        elif 0.24 <= Lr <=0.4:
            DHP = 0.23*R
        else:
            DHP = 0
    else:
        DHP = 0.5*R




